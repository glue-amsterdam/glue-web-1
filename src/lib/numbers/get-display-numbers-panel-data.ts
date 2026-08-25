import { sortByDisplayNumber } from "@/lib/numbers/compare-display-numbers";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { createClient } from "@/utils/supabase/server";
import type { InheritedHubOption } from "./pick-inherited-hub";
import type { HubMembershipLink } from "./hub-member-number-share";

export type DisplayNumberEntityType = "participant" | "hub";

export type DisplayNumberInheritedHub = InheritedHubOption;

export type DisplayNumberRow = {
  entityType: DisplayNumberEntityType;
  entityId: string;
  name: string;
  displayNumber: string | null;
  isActive: boolean;
  status: string;
  context: "solo" | "hub" | "hub-member" | "hub-host";
  slug: string | null;
  type: string;
  showHubNumber: boolean;
  preferredHubId: string | null;
  inheritedHubs: DisplayNumberInheritedHub[];
};

export type DisplayNumberOccupant = {
  entityType: DisplayNumberEntityType;
  entityId: string;
  name: string;
  displayNumber: string;
  isActive: boolean;
  status: string;
  onCurrentTourMap: boolean;
  visibilityReason: string;
};

export type DisplayNumbersPanelData = {
  rows: DisplayNumberRow[];
  occupantsByNumber: Record<string, DisplayNumberOccupant[]>;
  hubMemberships: HubMembershipLink[];
};

const buildOccupantsByNumber = (
  occupants: DisplayNumberOccupant[]
): Record<string, DisplayNumberOccupant[]> => {
  const map: Record<string, DisplayNumberOccupant[]> = {};

  for (const occupant of occupants) {
    const key = occupant.displayNumber.trim();
    if (!key) continue;

    if (!map[key]) {
      map[key] = [];
    }

    map[key].push(occupant);
  }

  return map;
};

const getParticipantContext = (
  userId: string,
  hubMemberIds: Set<string>,
  hubHostIds: Set<string>
): DisplayNumberRow["context"] => {
  if (hubHostIds.has(userId)) return "hub-host";
  if (hubMemberIds.has(userId)) return "hub-member";
  return "solo";
};

const getParticipantVisibilityReason = (
  participant: {
    user_id: string;
    is_active: boolean;
    status: string;
  },
  editableKeys: Set<string>
): { onCurrentTourMap: boolean; visibilityReason: string } => {
  if (editableKeys.has(`participant:${participant.user_id}`)) {
    return { onCurrentTourMap: true, visibilityReason: "in numbers list" };
  }

  if (!participant.is_active) {
    return { onCurrentTourMap: false, visibilityReason: "inactive" };
  }

  if (participant.status !== "accepted") {
    return { onCurrentTourMap: false, visibilityReason: participant.status };
  }

  return { onCurrentTourMap: false, visibilityReason: "not in numbers list" };
};

export const getDisplayNumbersPanelData =
  async (): Promise<DisplayNumbersPanelData> => {
    const supabase = await createClient();

    const [
      hubsResult,
      hubMembersResult,
      participantsResult,
      allParticipantsResult,
      allHubsWithNumber,
    ] = await Promise.all([
      supabase
        .from("hubs")
        .select("id, name, display_number, hub_host_id")
        .order("name"),
      supabase.from("hub_participants").select("user_id, hub_id"),
      supabase
        .from("participant_details")
        .select(
          "user_id, display_name, display_number, is_active, status, slug, category, show_hub_number, preferred_hub_id"
        )
        .eq("status", "accepted")
        .eq("is_active", true),
      supabase
        .from("participant_details")
        .select(
          "user_id, display_name, display_number, is_active, status, slug"
        )
        .not("display_number", "is", null),
      supabase
        .from("hubs")
        .select("id, name, display_number")
        .not("display_number", "is", null),
    ]);

    if (hubsResult.error) {
      console.error("getDisplayNumbersPanelData hubs:", hubsResult.error);
    }

    if (hubMembersResult.error) {
      console.error(
        "getDisplayNumbersPanelData hub members:",
        hubMembersResult.error
      );
    }

    if (participantsResult.error) {
      console.error(
        "getDisplayNumbersPanelData participants:",
        participantsResult.error
      );
    }

    type ParticipantListRow = {
      user_id: string;
      display_name: string | null;
      display_number: string | null;
      is_active: boolean;
      status: string;
      slug: string | null;
      category?: string | null;
      show_hub_number?: boolean | null;
      preferred_hub_id?: string | null;
    };

    let participantList: ParticipantListRow[] =
      (participantsResult.data as ParticipantListRow[] | null) ?? [];
    if (participantsResult.error) {
      const fallback = await supabase
        .from("participant_details")
        .select(
          "user_id, display_name, display_number, is_active, status, slug, category"
        )
        .eq("status", "accepted")
        .eq("is_active", true);
      participantList = (fallback.data as ParticipantListRow[] | null) ?? [];
    }

    if (allParticipantsResult.error) {
      console.error(
        "getDisplayNumbersPanelData all participants:",
        allParticipantsResult.error
      );
    }

    const hubs = hubsResult.data ?? [];
    const hubMemberRows = hubMembersResult.data ?? [];
    const hubMemberIds = new Set(hubMemberRows.map((row) => row.user_id));
    const hubHostIds = new Set(hubs.map((hub) => hub.hub_host_id));

    const hubsById = new Map(hubs.map((hub) => [hub.id, hub]));
    const inheritedHubsByUserId = new Map<string, DisplayNumberInheritedHub[]>();
    const hubMemberships: HubMembershipLink[] = [];
    const seenMembership = new Set<string>();

    const addInheritedHub = (
      userId: string,
      hub: (typeof hubs)[number],
      isHost: boolean
    ) => {
      const membershipKey = `${userId}:${hub.id}`;
      if (!seenMembership.has(membershipKey)) {
        seenMembership.add(membershipKey);
        hubMemberships.push({ userId, hubId: hub.id });
      }

      const current = inheritedHubsByUserId.get(userId) ?? [];
      if (current.some((item) => item.hubId === hub.id)) {
        if (isHost) {
          inheritedHubsByUserId.set(
            userId,
            current.map((item) =>
              item.hubId === hub.id ? { ...item, isHost: true } : item
            )
          );
        }
        return;
      }

      current.push({
        hubId: hub.id,
        name: hub.name,
        displayNumber: hub.display_number,
        type: "hub",
        isHost,
      });
      inheritedHubsByUserId.set(userId, current);
    };

    for (const hub of hubs) {
      addInheritedHub(hub.hub_host_id, hub, true);
    }

    for (const row of hubMemberRows) {
      const hub = hubsById.get(row.hub_id);
      if (!hub) continue;
      addInheritedHub(row.user_id, hub, hub.hub_host_id === row.user_id);
    }

    const editableKeys = new Set<string>();

    const hubRows: DisplayNumberRow[] = hubs.map((hub) => {
      editableKeys.add(`hub:${hub.id}`);

      return {
        entityType: "hub",
        entityId: hub.id,
        name: hub.name,
        displayNumber: hub.display_number,
        isActive: true,
        status: "accepted",
        context: "hub",
        slug: null,
        type: "hub",
        showHubNumber: true,
        preferredHubId: null,
        inheritedHubs: [],
      };
    });

    const participantRows: DisplayNumberRow[] = participantList.map(
      (participant) => {
        editableKeys.add(`participant:${participant.user_id}`);

        return {
          entityType: "participant",
          entityId: participant.user_id,
          name: getParticipantDisplayName(participant),
          displayNumber: participant.display_number,
          isActive: participant.is_active,
          status: participant.status,
          context: getParticipantContext(
            participant.user_id,
            hubMemberIds,
            hubHostIds
          ),
          slug: participant.slug,
          type: participant.category?.trim() || "standard",
          showHubNumber: participant.show_hub_number ?? true,
          preferredHubId: participant.preferred_hub_id ?? null,
          inheritedHubs: inheritedHubsByUserId.get(participant.user_id) ?? [],
        };
      }
    );

    const rows = sortByDisplayNumber(
      [...hubRows, ...participantRows],
      (row) => row.displayNumber
    );

    const occupants: DisplayNumberOccupant[] = [];

    for (const participant of allParticipantsResult.data ?? []) {
      const displayNumber = participant.display_number?.trim();
      if (!displayNumber) continue;

      const visibility = getParticipantVisibilityReason(
        participant,
        editableKeys
      );

      occupants.push({
        entityType: "participant",
        entityId: participant.user_id,
        name: getParticipantDisplayName(participant),
        displayNumber,
        isActive: participant.is_active,
        status: participant.status,
        onCurrentTourMap: visibility.onCurrentTourMap,
        visibilityReason: visibility.visibilityReason,
      });
    }

    for (const hub of allHubsWithNumber.data ?? []) {
      const displayNumber = hub.display_number?.trim();
      if (!displayNumber) continue;

      occupants.push({
        entityType: "hub",
        entityId: hub.id,
        name: hub.name,
        displayNumber,
        isActive: true,
        status: "accepted",
        onCurrentTourMap: editableKeys.has(`hub:${hub.id}`),
        visibilityReason: "in numbers list",
      });
    }

    return {
      rows,
      occupantsByNumber: buildOccupantsByNumber(occupants),
      hubMemberships,
    };
  };
