import type { SupabaseClient } from "@supabase/supabase-js";
import type { TourStatus } from "@/lib/participants/exhibitor-visibility";
import {
  getStickyParticipantIds,
  isParticipantEligibleForExhibitorsList,
} from "@/lib/participants/exhibitor-visibility";
import { classifyLocationType } from "./classify-location-type";
import {
  getEligibleHubMemberIds,
  getOrderedEligibleMemberIds,
} from "./hub-members";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { MapLocation, MapLocationDetailMember } from "./types";
import {
  ensureArray,
  getAddressLine,
  normalizeMapAddressLine,
} from "./utils";

type ParticipantRow = {
  user_id: string;
  slug: string | null;
  special_program: boolean;
  display_number: string | null;
  is_active: boolean;
  was_active_last_year: boolean;
  status: string;
  display_name: string | null;
};

type MapInfoRow = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  formatted_address: string | null;
};

type HubRow = {
  id: string;
  name: string;
  display_number: string | null;
  hub_host_id: string;
  hub_participants: { user_id: string } | { user_id: string }[] | null;
};

type LocationDraft = MapLocation & {
  hostUserId: string;
  hostSpecialProgram: boolean;
  hubRowId?: string;
};

type HubMembershipContext = {
  hubMapInfoId: string;
  hubAddressLine: string;
};

const getParticipantType = (specialProgram: boolean): ExhibitorType =>
  specialProgram ? "special-program" : "up-to-three-participants";

const resolveMemberMapLocationId = (
  userId: string,
  hubMapInfoId: string,
  hubAddressLine: string,
  mapInfoByUserId: Map<string, MapInfoRow>
): string => {
  const ownMapInfo = mapInfoByUserId.get(userId);
  if (!ownMapInfo) {
    return hubMapInfoId;
  }

  const ownAddressLine = normalizeMapAddressLine(
    getAddressLine(ownMapInfo.formatted_address)
  );
  if (!ownAddressLine || ownAddressLine === hubAddressLine) {
    return hubMapInfoId;
  }

  return ownMapInfo.id;
};

const buildHubMembers = (
  hub: HubRow,
  memberIds: Set<string>,
  participantByUserId: Map<string, ParticipantRow>,
  hubMapInfoId: string,
  hubAddressLine: string,
  mapInfoByUserId: Map<string, MapInfoRow>
): MapLocationDetailMember[] => {
  const members: MapLocationDetailMember[] = [];

  for (const userId of getOrderedEligibleMemberIds(hub, memberIds)) {
    const participant = participantByUserId.get(userId);
    if (!participant) continue;

    const slug = participant.slug?.trim();
    const ownMapInfo = mapInfoByUserId.get(userId);
    const locationId = resolveMemberMapLocationId(
      userId,
      hubMapInfoId,
      hubAddressLine,
      mapInfoByUserId
    );

    members.push({
      userId,
      name: getParticipantDisplayName(participant),
      type: getParticipantType(participant.special_program),
      displayNumber: participant.display_number,
      locationId,
      ...(slug ? { slug } : {}),
      ...(ownMapInfo?.id &&
      locationId === hubMapInfoId &&
      ownMapInfo.id !== hubMapInfoId
        ? { ownMapInfoId: ownMapInfo.id }
        : {}),
    });
  }

  return members;
};

const shouldSkipSoloLocationForHubMember = (
  participantUserId: string,
  mapInfo: MapInfoRow,
  hubRows: HubRow[],
  eligibleParticipantIds: Set<string>,
  mapInfoByUserId: Map<string, MapInfoRow>
): boolean => {
  const ownAddressLine = normalizeMapAddressLine(
    getAddressLine(mapInfo.formatted_address)
  );

  for (const hub of hubRows) {
    const memberIds = getEligibleHubMemberIds(hub, eligibleParticipantIds);
    if (!memberIds.has(participantUserId)) continue;

    const hostMapInfo = mapInfoByUserId.get(hub.hub_host_id);
    if (!hostMapInfo) continue;

    const hubAddressLine = normalizeMapAddressLine(
      getAddressLine(hostMapInfo.formatted_address)
    );

    if (!ownAddressLine || ownAddressLine === hubAddressLine) {
      return true;
    }
  }

  return false;
};

export const buildMapLocations = async (
  supabase: SupabaseClient,
  tourStatus: TourStatus
): Promise<MapLocation[]> => {
  const [participantsResult, stickyIds, hubsResult] = await Promise.all([
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
        display_name
      `
      )
      .eq("status", "accepted"),
    getStickyParticipantIds(supabase),
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

  const participants = (participantsResult.data as ParticipantRow[]) ?? [];
  const eligibleParticipants = participants.filter((participant) =>
    isParticipantEligibleForExhibitorsList(participant, stickyIds, tourStatus)
  );

  const eligibleParticipantIds = new Set(
    eligibleParticipants.map((participant) => participant.user_id)
  );

  const participantByUserId = new Map(
    eligibleParticipants.map((participant) => [participant.user_id, participant])
  );

  if (eligibleParticipantIds.size === 0) {
    return [];
  }

  const { data: mapInfoData, error: mapInfoError } = await supabase
    .from("map_info")
    .select("id, user_id, latitude, longitude, formatted_address")
    .in("user_id", Array.from(eligibleParticipantIds));

  if (mapInfoError) throw mapInfoError;

  const mapInfoByUserId = new Map<string, MapInfoRow>();
  for (const row of (mapInfoData as MapInfoRow[]) ?? []) {
    mapInfoByUserId.set(row.user_id, row);
  }

  const locationByMapInfoId = new Map<string, LocationDraft>();
  const hubRows = (hubsResult.data as HubRow[]) ?? [];
  const processedHubHostIds = new Set<string>();
  const hubMembershipByUserId = new Map<string, HubMembershipContext>();

  for (const hub of hubRows) {
    if (!eligibleParticipantIds.has(hub.hub_host_id)) continue;

    const hostMapInfo = mapInfoByUserId.get(hub.hub_host_id);
    if (!hostMapInfo) continue;

    const hostParticipant = participantByUserId.get(hub.hub_host_id);
    if (!hostParticipant) continue;

    const memberIds = getEligibleHubMemberIds(hub, eligibleParticipantIds);
    const memberCount = memberIds.size;
    if (memberCount === 0) continue;

    processedHubHostIds.add(hub.hub_host_id);

    const hubAddressLine = normalizeMapAddressLine(
      getAddressLine(hostMapInfo.formatted_address)
    );
    const hubMembership: HubMembershipContext = {
      hubMapInfoId: hostMapInfo.id,
      hubAddressLine,
    };

    if (!hubMembershipByUserId.has(hub.hub_host_id)) {
      hubMembershipByUserId.set(hub.hub_host_id, hubMembership);
    }

    for (const userId of memberIds) {
      if (!hubMembershipByUserId.has(userId)) {
        hubMembershipByUserId.set(userId, hubMembership);
      }
    }

    const type = classifyLocationType(
      memberCount,
      hostParticipant.special_program
    );

    const members = buildHubMembers(
      hub,
      memberIds,
      participantByUserId,
      hostMapInfo.id,
      hubAddressLine,
      mapInfoByUserId
    );

    locationByMapInfoId.set(hostMapInfo.id, {
      id: hostMapInfo.id,
      latitude: hostMapInfo.latitude,
      longitude: hostMapInfo.longitude,
      type,
      name: hub.name,
      displayNumber: hub.display_number,
      addressLine: hubAddressLine,
      hubId: hub.id,
      hubHostUserId: hub.hub_host_id,
      memberCount,
      ...(members.length > 0 ? { members } : {}),
      hostUserId: hub.hub_host_id,
      hostSpecialProgram: hostParticipant.special_program,
      hubRowId: hub.id,
    });
  }

  for (const participant of eligibleParticipants) {
    if (processedHubHostIds.has(participant.user_id)) continue;

    const mapInfo = mapInfoByUserId.get(participant.user_id);
    if (!mapInfo) continue;

    if (
      shouldSkipSoloLocationForHubMember(
        participant.user_id,
        mapInfo,
        hubRows,
        eligibleParticipantIds,
        mapInfoByUserId
      )
    ) {
      continue;
    }

    locationByMapInfoId.set(mapInfo.id, {
      id: mapInfo.id,
      latitude: mapInfo.latitude,
      longitude: mapInfo.longitude,
      type: classifyLocationType(1, participant.special_program),
      name: getParticipantDisplayName(participant),
      displayNumber: participant.display_number,
      addressLine: getAddressLine(mapInfo.formatted_address),
      slug: participant.slug ?? undefined,
      memberCount: 1,
      hostUserId: participant.user_id,
      hostSpecialProgram: participant.special_program,
    });
  }

  return Array.from(locationByMapInfoId.values()).map(
    ({
      hostUserId: _hostUserId,
      hostSpecialProgram: _hostSpecialProgram,
      hubRowId: _hubRowId,
      ...location
    }) => location
  );
};

export const createMapLocationSnapshot = (locations: MapLocation[]) => ({
  version: 2 as const,
  capturedAt: new Date().toISOString(),
  locations,
});
