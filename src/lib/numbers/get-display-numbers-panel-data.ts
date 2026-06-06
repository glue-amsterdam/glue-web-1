import { sortByDisplayNumber } from "@/lib/numbers/compare-display-numbers";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { createClient } from "@/utils/supabase/server";

export type DisplayNumberEntityType = "participant" | "hub";

export type DisplayNumberRow = {
  entityType: DisplayNumberEntityType;
  entityId: string;
  name: string;
  displayNumber: string | null;
  isActive: boolean;
  status: string;
  context: "solo" | "hub" | "hub-member" | "hub-host";
  slug: string | null;
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
    ] = await Promise.all([
      supabase
        .from("hubs")
        .select("id, name, display_number, hub_host_id")
        .order("name"),
      supabase.from("hub_participants").select("user_id, hub_id"),
      supabase
        .from("participant_details")
        .select(
          "user_id, display_name, display_number, is_active, status, slug"
        )
        .eq("status", "accepted")
        .eq("is_active", true),
      supabase
        .from("participant_details")
        .select(
          "user_id, display_name, display_number, is_active, status, slug"
        )
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

    if (allParticipantsResult.error) {
      console.error(
        "getDisplayNumbersPanelData all participants:",
        allParticipantsResult.error
      );
    }

    const hubs = hubsResult.data ?? [];
    const hubMemberIds = new Set(
      (hubMembersResult.data ?? []).map((row) => row.user_id)
    );
    const hubHostIds = new Set(hubs.map((hub) => hub.hub_host_id));

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
      };
    });

    const participantRows: DisplayNumberRow[] = (participantsResult.data ?? []).map(
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
        };
      }
    );

    const rows = sortByDisplayNumber(
      [...hubRows, ...participantRows],
      (row) => row.displayNumber
    );

    const allHubsWithNumber = await supabase
      .from("hubs")
      .select("id, name, display_number")
      .not("display_number", "is", null);

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
    };
  };
