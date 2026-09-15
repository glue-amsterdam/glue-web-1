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
import {
  getPrimaryDisplayNumber,
  resolveDisplayNumberBadges,
  type DisplayNumberHubInput,
} from "@/lib/numbers/resolve-display-number-badges";

export type ProgramOrganizerBadge = {
  type: ExhibitorType;
  displayNumber: string;
};

const hasDisplayNumber = (value: string | null | undefined): boolean =>
  Boolean(value?.trim());

export const organizerBadgeFromParticipant = (
  category: string,
  displayNumber: string | null,
  categories: ParticipantCategory[],
  options?: {
    showHubNumber?: boolean;
    hubs?: DisplayNumberHubInput[];
  }
): ProgramOrganizerBadge => {
  const ownType = classifyLocationType(1, category, categories);
  const badges = resolveDisplayNumberBadges({
    ownNumber: displayNumber,
    ownType,
    showHubNumber: options?.showHubNumber ?? true,
    hubs: options?.hubs,
  });
  const primary = getPrimaryDisplayNumber(badges);

  return {
    type: badges[0]?.type ?? ownType,
    displayNumber: primary ?? " ",
  };
};

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

  const locationBadge = locationIndex.get(locationId);
  if (!locationBadge) {
    return organizerFallback;
  }

  if (hasDisplayNumber(locationBadge.displayNumber)) {
    return locationBadge;
  }

  if (hasDisplayNumber(organizerFallback.displayNumber)) {
    return {
      type: locationBadge.type,
      displayNumber: organizerFallback.displayNumber,
    };
  }

  return locationBadge;
};

type HostParticipantRow = {
  user_id: string;
  category: string;
  display_number: string | null;
  show_hub_number?: boolean | null;
  is_active: boolean;
  was_active_last_year: boolean;
  status: string;
};

type HubParticipantRow = { user_id: string };

type HubRow = {
  id: string;
  name: string;
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

type HubEmbed = {
  id: string;
  name: string;
  display_number: string | null;
  hub_host_id: string;
  hub_participants: HubParticipantRow | HubParticipantRow[] | null;
};

type HubMembershipEmbed = {
  hub_id: string;
  hubs: HubEmbed | HubEmbed[] | null;
};

const toHubRow = (hub: HubEmbed): HubRow => ({
  id: hub.id,
  name: hub.name,
  hub_host_id: hub.hub_host_id,
  display_number: hub.display_number,
  hub_participants: hub.hub_participants,
});

const collectHubRowsForUsers = (
  hostedHubs: HubRow[],
  membershipRows: HubMembershipEmbed[]
): HubRow[] => {
  const hubsById = new Map<string, HubRow>();

  for (const hub of hostedHubs) {
    hubsById.set(hub.id, hub);
  }

  for (const row of membershipRows) {
    const hubEmbed = Array.isArray(row.hubs) ? row.hubs[0] : row.hubs;
    if (!hubEmbed) continue;
    if (!hubsById.has(hubEmbed.id)) {
      hubsById.set(hubEmbed.id, toHubRow(hubEmbed));
    }
  }

  return Array.from(hubsById.values());
};

/** Batch-load inherited hub number options for the given user IDs. */
export const loadInheritedHubInputsByUserId = async (
  supabase: SupabaseClient,
  userIds: string[],
  tourStatus: TourStatus,
  categories: ParticipantCategory[],
  stickyIds?: Set<string>
): Promise<Map<string, DisplayNumberHubInput[]>> => {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const result = new Map<string, DisplayNumberHubInput[]>();

  if (uniqueIds.length === 0) {
    return result;
  }

  const resolvedStickyIds = stickyIds ?? (await getStickyParticipantIds(supabase));

  const [hostedResult, membershipResult] = await Promise.all([
    supabase
      .from("hubs")
      .select(
        `
        id,
        name,
        display_number,
        hub_host_id,
        hub_participants (
          user_id
        )
      `
      )
      .in("hub_host_id", uniqueIds),
    supabase
      .from("hub_participants")
      .select(
        `
        hub_id,
        hubs (
          id,
          name,
          display_number,
          hub_host_id,
          hub_participants (
            user_id
          )
        )
      `
      )
      .in("user_id", uniqueIds),
  ]);

  if (hostedResult.error) throw hostedResult.error;
  if (membershipResult.error) throw membershipResult.error;

  const hubRows = collectHubRowsForUsers(
    (hostedResult.data as HubRow[] | null) ?? [],
    (membershipResult.data as HubMembershipEmbed[] | null) ?? []
  );

  if (hubRows.length === 0) {
    return result;
  }

  const allMemberUserIds = new Set<string>();
  for (const hub of hubRows) {
    allMemberUserIds.add(hub.hub_host_id);
    for (const participant of ensureArray(hub.hub_participants)) {
      allMemberUserIds.add(participant.user_id);
    }
  }

  const { data: memberRows, error: memberError } = await supabase
    .from("participant_details")
    .select(
      "user_id, category, display_number, is_active, was_active_last_year, status"
    )
    .in("user_id", Array.from(allMemberUserIds))
    .eq("status", "accepted");

  if (memberError) throw memberError;

  const eligibleMemberIds = new Set(
    ((memberRows as HubMemberRow[] | null) ?? [])
      .filter((member) =>
        isParticipantEligibleForExhibitorsList(
          member,
          resolvedStickyIds,
          tourStatus
        )
      )
      .map((member) => member.user_id)
  );

  const participantByUserId = new Map(
    ((memberRows as HostParticipantRow[] | null) ?? []).map((row) => [
      row.user_id,
      row,
    ])
  );

  const targetIdSet = new Set(uniqueIds);

  for (const hub of hubRows) {
    const memberIds = getEligibleHubMemberIds(hub, eligibleMemberIds);
    if (memberIds.size === 0) continue;

    const host = participantByUserId.get(hub.hub_host_id);
    const hubType = classifyLocationType(
      memberIds.size,
      host?.category,
      categories
    );
    const option: DisplayNumberHubInput = {
      number: hub.display_number,
      type: hubType,
    };

    for (const userId of memberIds) {
      if (!targetIdSet.has(userId)) continue;
      const current = result.get(userId) ?? [];
      if (
        current.some(
          (item) =>
            (item.number ?? "").trim() === (option.number ?? "").trim() &&
            item.type === option.type
        )
      ) {
        continue;
      }
      current.push(option);
      result.set(userId, current);
    }
  }

  return result;
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

  const [participantsResult, hubsAsHostResult, inheritedHubsByUserId] =
    await Promise.all([
      supabase
        .from("participant_details")
        .select(
          "user_id, category, display_number, show_hub_number, is_active, was_active_last_year, status"
        )
        .in("user_id", userIds)
        .eq("status", "accepted"),
      supabase
        .from("hubs")
        .select(
          `
          id,
          name,
          display_number,
          hub_host_id,
          hub_participants (
            user_id
          )
        `
        )
        .in("hub_host_id", userIds),
      loadInheritedHubInputsByUserId(
        supabase,
        userIds,
        tourStatus,
        categories,
        stickyIds
      ),
    ]);

  if (participantsResult.error) throw participantsResult.error;
  if (hubsAsHostResult.error) throw hubsAsHostResult.error;

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
    ((hubsAsHostResult.data as HubRow[] | null) ?? []).map((hub) => [
      hub.hub_host_id,
      hub,
    ])
  );

  const hubRows = (hubsAsHostResult.data as HubRow[] | null) ?? [];
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

    index.set(
      mapInfo.id,
      organizerBadgeFromParticipant(host.category, host.display_number, categories, {
        showHubNumber: host.show_hub_number ?? true,
        hubs: inheritedHubsByUserId.get(mapInfo.user_id) ?? [],
      })
    );
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

  return resolveOrganizerBadge(locationId, index, organizerFallback);
};
