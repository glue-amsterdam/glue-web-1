import type { SupabaseClient } from "@supabase/supabase-js";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import type { DisplayNumberEntityType } from "./get-display-numbers-panel-data";

export type DisplayNumberOccupantResult = {
  entityType: DisplayNumberEntityType;
  entityId: string;
  name: string;
  displayNumber: string;
  isActive?: boolean;
  status?: string;
};

type CheckDisplayNumberParams = {
  supabase: SupabaseClient;
  displayNumber: string;
  entityType: DisplayNumberEntityType;
  entityId?: string;
};

type CheckDisplayNumberResult = {
  isAvailable: boolean;
  occupants: DisplayNumberOccupantResult[];
  error: unknown | null;
};

export const checkDisplayNumberAvailable = async ({
  supabase,
  displayNumber,
  entityType,
  entityId,
}: CheckDisplayNumberParams): Promise<CheckDisplayNumberResult> => {
  const trimmed = displayNumber.trim();
  if (!trimmed) {
    return { isAvailable: true, occupants: [], error: null };
  }

  let participantQuery = supabase
    .from("participant_details")
    .select("user_id, display_name, display_number, is_active, status")
    .eq("display_number", trimmed);

  if (entityType === "participant" && entityId) {
    participantQuery = participantQuery.neq("user_id", entityId);
  }

  let hubQuery = supabase
    .from("hubs")
    .select("id, name, display_number")
    .eq("display_number", trimmed);

  if (entityType === "hub" && entityId) {
    hubQuery = hubQuery.neq("id", entityId);
  }

  const [participantResult, hubResult] = await Promise.all([
    participantQuery,
    hubQuery,
  ]);

  if (participantResult.error) {
    return {
      isAvailable: false,
      occupants: [],
      error: participantResult.error,
    };
  }

  if (hubResult.error) {
    return { isAvailable: false, occupants: [], error: hubResult.error };
  }

  const occupants: DisplayNumberOccupantResult[] = [];

  for (const participant of participantResult.data ?? []) {
    occupants.push({
      entityType: "participant",
      entityId: participant.user_id,
      name: getParticipantDisplayName(participant),
      displayNumber: participant.display_number ?? trimmed,
      isActive: participant.is_active,
      status: participant.status,
    });
  }

  for (const hub of hubResult.data ?? []) {
    occupants.push({
      entityType: "hub",
      entityId: hub.id,
      name: hub.name,
      displayNumber: hub.display_number ?? trimmed,
    });
  }

  return {
    isAvailable: occupants.length === 0,
    occupants,
    error: null,
  };
};

export const normalizeDisplayNumberInput = (
  value: string | null | undefined
): string | null => {
  if (value == null) return null;

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};
