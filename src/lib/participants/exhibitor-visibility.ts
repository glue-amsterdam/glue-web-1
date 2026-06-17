import type { SupabaseClient } from "@supabase/supabase-js";

export type TourStatus = "new" | "older";

export const getTourStatus = async (
  supabase: SupabaseClient
): Promise<TourStatus> => {
  const { data, error } = await supabase
    .from("tour_status")
    .select("current_tour_status")
    .single();

  if (error) {
    console.error("Error fetching tour status:", error);
    return "new";
  }

  return data?.current_tour_status === "older" ? "older" : "new";
};

export const getStickyParticipantIds = async (
  supabase: SupabaseClient
): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from("sticky_group_participants")
    .select("participant_user_id");

  if (error) {
    console.error("Error fetching sticky participants:", error);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.participant_user_id));
};

export const isParticipantSticky = async (
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("sticky_group_participants")
    .select("participant_user_id")
    .eq("participant_user_id", userId);

  if (error) {
    console.error("Error checking sticky participant:", error);
    return false;
  }

  return Boolean(data && data.length > 0);
};

type ParticipantVisibilityRow = {
  is_active: boolean;
  was_active_last_year: boolean;
};

/** Visibility for public participant profile (client-user rules). */
export const isParticipantPubliclyVisible = (
  participant: ParticipantVisibilityRow,
  tourStatus: TourStatus
): boolean => {
  if (tourStatus === "new") {
    return participant.is_active;
  }

  return participant.was_active_last_year || participant.is_active;
};

type ParticipantEligibilityRow = ParticipantVisibilityRow & {
  user_id: string;
  status: string;
};

/** Eligibility for exhibitors list and hub detail (get-exhibitors rules). */
export const isParticipantEligibleForExhibitorsList = (
  participant: ParticipantEligibilityRow,
  stickyIds: Set<string>,
  tourStatus: TourStatus
): boolean => {
  if (participant.status !== "accepted") return false;

  if (stickyIds.has(participant.user_id)) return true;

  if (tourStatus === "new") return participant.is_active;
  if (tourStatus === "older") return participant.was_active_last_year;

  return false;
};
