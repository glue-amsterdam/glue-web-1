import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyLocationType } from "@/lib/map/classify-location-type";
import { getEligibleHubMemberIds } from "@/lib/map/hub-members";
import type { MapLocation } from "@/lib/map/types";
import { ensureArray } from "@/lib/map/utils";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
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
  specialProgram: boolean,
  displayNumber: string | null
): ProgramOrganizerBadge => ({
  type: specialProgram ? "special-program" : "up-to-three-participants",
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
  special_program: boolean;
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

export const resolveLocationOrganizerBadge = async (
  supabase: SupabaseClient,
  locationId: string | null | undefined,
  tourStatus: TourStatus,
  organizerFallback: ProgramOrganizerBadge
): Promise<ProgramOrganizerBadge> => {
  if (!locationId) {
    return organizerFallback;
  }

  const { data: mapInfo, error: mapInfoError } = await supabase
    .from("map_info")
    .select("id, user_id")
    .eq("id", locationId)
    .maybeSingle();

  if (mapInfoError) throw mapInfoError;
  if (!mapInfo) return organizerFallback;

  const [stickyIds, participantResult, hubsResult] = await Promise.all([
    getStickyParticipantIds(supabase),
    supabase
      .from("participant_details")
      .select(
        "user_id, special_program, display_number, is_active, was_active_last_year, status"
      )
      .eq("user_id", mapInfo.user_id)
      .eq("status", "accepted")
      .maybeSingle(),
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
      .eq("hub_host_id", mapInfo.user_id),
  ]);

  const host = participantResult.data as HostParticipantRow | null;
  if (
    !host ||
    !isParticipantEligibleForExhibitorsList(host, stickyIds, tourStatus)
  ) {
    return organizerFallback;
  }

  const hubRows = (hubsResult.data as HubRow[] | null) ?? [];
  const hub = hubRows[0];

  if (hub) {
    const memberUserIds = new Set<string>([hub.hub_host_id]);
    for (const participant of ensureArray(hub.hub_participants)) {
      memberUserIds.add(participant.user_id);
    }

    const { data: memberRows, error: memberError } = await supabase
      .from("participant_details")
      .select("user_id, is_active, was_active_last_year, status")
      .in("user_id", Array.from(memberUserIds))
      .eq("status", "accepted");

    if (memberError) throw memberError;

    const eligibleParticipantIds = new Set(
      ((memberRows as HubMemberRow[] | null) ?? [])
        .filter((member) =>
          isParticipantEligibleForExhibitorsList(member, stickyIds, tourStatus)
        )
        .map((member) => member.user_id)
    );

    const memberCount = getEligibleHubMemberIds(hub, eligibleParticipantIds).size;
    if (memberCount > 0) {
      return {
        type: classifyLocationType(memberCount, host.special_program),
        displayNumber: hub.display_number ?? " ",
      };
    }
  }

  return {
    type: classifyLocationType(1, host.special_program),
    displayNumber: host.display_number ?? " ",
  };
};
