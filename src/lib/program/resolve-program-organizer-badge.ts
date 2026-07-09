import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyLocationType } from "@/lib/map/classify-location-type";
import { getEligibleHubMemberIds } from "@/lib/map/hub-members";
import { ensureArray } from "@/lib/map/utils";
import type { MapLocation } from "@/lib/map/types";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import {
  fetchParticipantCategories,
  type ParticipantCategory,
} from "@/lib/participants/participant-categories";
import {
  getStickyParticipantIds,
  isParticipantEligibleForExhibitorsList,
  type TourStatus,
} from "@/lib/participants/exhibitor-visibility";

export type ProgramOrganizerBadge = {
  type: ExhibitorType;
  displayNumber: string;
};

export const organizerBadgeFromParticipant = (
  category: string,
  displayNumber: string | null,
  categories: ParticipantCategory[]
): ProgramOrganizerBadge => ({
  type: classifyLocationType(1, category, categories),
  displayNumber: displayNumber ?? " ",
});

export const buildLocationBadgeIndex = (
  locations: MapLocation[]
): Map<string, ProgramOrganizerBadge> => {
  const index = new Map<string, ProgramOrganizerBadge>();

  for (const location of locations) {
    index.set(location.id, {
      type: location.type,
      displayNumber: location.displayNumber ?? " ",
    });
  }

  return index;
};

export const resolveOrganizerBadge = (
  locationId: string | null | undefined,
  locationIndex: Map<string, ProgramOrganizerBadge>,
  organizerFallback: ProgramOrganizerBadge
): ProgramOrganizerBadge => {
  if (!locationId) {
    return organizerFallback;
  }

  return locationIndex.get(locationId) ?? organizerFallback;
};

type HostParticipantRow = {
  user_id: string;
  category: string;
  display_number: string | null;
  is_active: boolean;
  was_active_last_year: boolean;
  status: string;
};

type HubParticipantRow = { user_id: string };

type HubRow = {
  hub_host_id: string;
  display_number: string | null;
  hub_participants: HubParticipantRow | HubParticipantRow[] | null;
};

type HubMemberRow = {
  user_id: string;
  is_active: boolean;
  was_active_last_year: boolean;
  status: string;
};

type MapInfoRow = {
  id: string;
  user_id: string;
};

/** Badge lookup for specific map_info IDs only (avoids full buildMapLocations). */
export const buildProgramLocationBadgeIndex = async (
  supabase: SupabaseClient,
  locationIds: Array<string | null | undefined>,
  tourStatus: TourStatus
): Promise<Map<string, ProgramOrganizerBadge>> => {
  const uniqueIds = [
    ...new Set(locationIds.filter((id): id is string => Boolean(id))),
  ];
  const index = new Map<string, ProgramOrganizerBadge>();

  if (uniqueIds.length === 0) {
    return index;
  }

  const [categories, stickyIds, mapInfoResult] = await Promise.all([
    fetchParticipantCategories(supabase),
    getStickyParticipantIds(supabase),
    supabase.from("map_info").select("id, user_id").in("id", uniqueIds),
  ]);

  if (mapInfoResult.error) throw mapInfoResult.error;

  const mapInfoRows = (mapInfoResult.data as MapInfoRow[] | null) ?? [];
  if (mapInfoRows.length === 0) {
    return index;
  }

  const userIds = [...new Set(mapInfoRows.map((row) => row.user_id))];

  const [participantsResult, hubsResult] = await Promise.all([
    supabase
      .from("participant_details")
      .select(
        "user_id, category, display_number, is_active, was_active_last_year, status"
      )
      .in("user_id", userIds)
      .eq("status", "accepted"),
    supabase
      .from("hubs")
      .select(
        `
        display_number,
        hub_host_id,
        hub_participants (
          user_id
        )
      `
      )
      .in("hub_host_id", userIds),
  ]);

  if (participantsResult.error) throw participantsResult.error;
  if (hubsResult.error) throw hubsResult.error;

  const participantByUserId = new Map(
    ((participantsResult.data as HostParticipantRow[] | null) ?? [])
      .filter((participant) =>
        isParticipantEligibleForExhibitorsList(
          participant,
          stickyIds,
          tourStatus
        )
      )
      .map((participant) => [participant.user_id, participant])
  );

  const hubByHostId = new Map(
    ((hubsResult.data as HubRow[] | null) ?? []).map((hub) => [
      hub.hub_host_id,
      hub,
    ])
  );

  const hubRows = (hubsResult.data as HubRow[] | null) ?? [];
  const allMemberUserIds = new Set<string>();
  for (const hub of hubRows) {
    allMemberUserIds.add(hub.hub_host_id);
    for (const participant of ensureArray(hub.hub_participants)) {
      allMemberUserIds.add(participant.user_id);
    }
  }

  let eligibleMemberIds = new Set<string>();
  if (allMemberUserIds.size > 0) {
    const { data: memberRows, error: memberError } = await supabase
      .from("participant_details")
      .select("user_id, is_active, was_active_last_year, status")
      .in("user_id", Array.from(allMemberUserIds))
      .eq("status", "accepted");

    if (memberError) throw memberError;

    eligibleMemberIds = new Set(
      ((memberRows as HubMemberRow[] | null) ?? [])
        .filter((member) =>
          isParticipantEligibleForExhibitorsList(member, stickyIds, tourStatus)
        )
        .map((member) => member.user_id)
    );
  }

  for (const mapInfo of mapInfoRows) {
    const host = participantByUserId.get(mapInfo.user_id);
    if (!host) continue;

    const hub = hubByHostId.get(mapInfo.user_id);
    if (hub) {
      const memberCount = getEligibleHubMemberIds(hub, eligibleMemberIds).size;
      if (memberCount > 0) {
        index.set(mapInfo.id, {
          type: classifyLocationType(memberCount, host.category, categories),
          displayNumber: hub.display_number ?? " ",
        });
        continue;
      }
    }

    index.set(mapInfo.id, {
      type: classifyLocationType(1, host.category, categories),
      displayNumber: host.display_number ?? " ",
    });
  }

  return index;
};

export const resolveLocationOrganizerBadge = async (
  supabase: SupabaseClient,
  locationId: string | null | undefined,
  tourStatus: TourStatus,
  organizerFallback: ProgramOrganizerBadge
): Promise<ProgramOrganizerBadge> => {
  if (!locationId) {
    return organizerFallback;
  }

  const index = await buildProgramLocationBadgeIndex(
    supabase,
    [locationId],
    tourStatus
  );

  return index.get(locationId) ?? organizerFallback;
};
