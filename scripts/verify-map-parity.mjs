/**
 * Compares map markers from createPublicSupabaseClient vs anon createClient.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
 *
 * Usage: node --env-file=.env.local scripts/verify-map-parity.mjs
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
  process.exit(1);
}

const classifyLocationType = (memberCount, primarySpecialProgram) => {
  if (memberCount > 3) return "hub";
  if (memberCount === 1 && primarySpecialProgram) return "special-program";
  return "up-to-three-participants";
};

const getEligibleHubMemberIds = (hub, eligibleParticipantIds) => {
  const memberIds = new Set([hub.hub_host_id]);
  const participants = Array.isArray(hub.hub_participants)
    ? hub.hub_participants
    : hub.hub_participants
      ? [hub.hub_participants]
      : [];

  for (const participant of participants) {
    if (eligibleParticipantIds.has(participant.user_id)) {
      memberIds.add(participant.user_id);
    }
  }

  return memberIds;
};

const isParticipantEligibleForExhibitorsList = (
  participant,
  stickyIds,
  tourStatus
) => {
  if (participant.status !== "accepted") return false;
  if (stickyIds.has(participant.user_id)) return true;
  if (tourStatus === "older") return participant.was_active_last_year === true;
  return participant.is_active === true;
};

const getUserName = (userInfo) => {
  if (Array.isArray(userInfo)) return userInfo[0]?.user_name ?? "Unknown";
  return userInfo?.user_name ?? "Unknown";
};

const getAddressLine = (formattedAddress) =>
  formattedAddress?.split(",")[0]?.trim() ?? formattedAddress ?? "";

const buildMapLocations = async (supabase, tourStatus) => {
  const [participantsResult, stickyResult, hubsResult] = await Promise.all([
    supabase
      .from("participant_details")
      .select(
        `
        user_id,
        slug,
        special_program,
        display_number,
        is_active,
        was_active_last_year,
        status,
        user_info!inner (
          user_id,
          user_name
        )
      `
      )
      .eq("status", "accepted"),
    supabase.from("sticky_group_participants").select("participant_user_id"),
    supabase.from("hubs").select(
      `
        id,
        name,
        display_number,
        hub_host_id,
        hub_participants (
          user_id
        )
      `
    ),
  ]);

  if (participantsResult.error) throw participantsResult.error;
  if (hubsResult.error) throw hubsResult.error;
  if (stickyResult.error) throw stickyResult.error;

  const stickyIds = new Set(
    (stickyResult.data ?? []).map((row) => row.participant_user_id)
  );

  const eligibleParticipants = (participantsResult.data ?? []).filter(
    (participant) =>
      isParticipantEligibleForExhibitorsList(
        participant,
        stickyIds,
        tourStatus
      )
  );

  const eligibleParticipantIds = new Set(
    eligibleParticipants.map((participant) => participant.user_id)
  );

  if (eligibleParticipantIds.size === 0) return [];

  const { data: mapInfoData, error: mapInfoError } = await supabase
    .from("map_info")
    .select("id, user_id, latitude, longitude, formatted_address")
    .in("user_id", [...eligibleParticipantIds]);

  if (mapInfoError) throw mapInfoError;

  const mapInfoByUserId = new Map(
    (mapInfoData ?? []).map((row) => [row.user_id, row])
  );
  const participantByUserId = new Map(
    eligibleParticipants.map((participant) => [participant.user_id, participant])
  );

  const locationByMapInfoId = new Map();
  const processedHubHostIds = new Set();

  for (const hub of hubsResult.data ?? []) {
    if (!eligibleParticipantIds.has(hub.hub_host_id)) continue;

    const hostMapInfo = mapInfoByUserId.get(hub.hub_host_id);
    if (!hostMapInfo) continue;

    const hostParticipant = participantByUserId.get(hub.hub_host_id);
    if (!hostParticipant) continue;

    const memberIds = getEligibleHubMemberIds(hub, eligibleParticipantIds);
    const memberCount = memberIds.size;
    if (memberCount === 0) continue;

    processedHubHostIds.add(hub.hub_host_id);

    locationByMapInfoId.set(hostMapInfo.id, {
      id: hostMapInfo.id,
      type: classifyLocationType(memberCount, hostParticipant.special_program),
      name: hub.name,
      displayNumber: hub.display_number,
      hubId: hub.id,
      memberCount,
    });
  }

  for (const participant of eligibleParticipants) {
    if (processedHubHostIds.has(participant.user_id)) continue;

    const mapInfo = mapInfoByUserId.get(participant.user_id);
    if (!mapInfo) continue;

    locationByMapInfoId.set(mapInfo.id, {
      id: mapInfo.id,
      type: classifyLocationType(1, participant.special_program),
      name: getUserName(participant.user_info),
      displayNumber: participant.display_number,
      slug: participant.slug ?? undefined,
      memberCount: 1,
    });
  }

  return [...locationByMapInfoId.values()];
};

const compareMapLocationSets = (baseline, candidate) => {
  const differences = [];
  const baselineById = new Map(baseline.map((location) => [location.id, location]));
  const candidateById = new Map(
    candidate.map((location) => [location.id, location])
  );

  for (const id of baselineById.keys()) {
    if (!candidateById.has(id)) differences.push(`Missing in candidate: ${id}`);
  }

  for (const id of candidateById.keys()) {
    if (!baselineById.has(id)) differences.push(`Extra in candidate: ${id}`);
  }

  for (const [id, base] of baselineById) {
    const cand = candidateById.get(id);
    if (!cand) continue;

    for (const field of ["type", "name", "displayNumber", "memberCount", "hubId"]) {
      if (base[field] !== cand[field]) {
        differences.push(
          `${id}.${field}: baseline=${String(base[field])} candidate=${String(cand[field])}`
        );
      }
    }
  }

  return { match: differences.length === 0, differences };
};

const publicClient = createClient(supabaseUrl, supabaseAnonKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

const [publicLocations, anonLocations] = await Promise.all([
  buildMapLocations(publicClient, "new"),
  buildMapLocations(anonClient, "new"),
]);

const parity = compareMapLocationSets(publicLocations, anonLocations);

console.log("=== Map QA: RLS / public client parity ===\n");
console.log(`Public client locations: ${publicLocations.length}`);
console.log(`Anon client locations:   ${anonLocations.length}`);

if (parity.match) {
  console.log("PASS  public client matches anon client marker set");
  process.exit(0);
}

console.log("FAIL  public client differs from anon client");
for (const diff of parity.differences.slice(0, 20)) {
  console.log(`       ${diff}`);
}
process.exit(1);
