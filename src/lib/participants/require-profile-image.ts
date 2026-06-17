import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlanMaxImagesForUser } from "@/lib/plans/get-plan-max-images-for-user";

type ParticipantStatus = {
  is_active: boolean;
  status: string;
};

export const requiresProfileImage = async (
  supabase: SupabaseClient,
  userId: string,
  isMod: boolean
): Promise<boolean> => {
  if (isMod) {
    return false;
  }

  const planMaxImages = await getPlanMaxImagesForUser(userId);
  if (planMaxImages <= 0) {
    return false;
  }

  const { data: participantDetails } = await supabase
    .from("participant_details")
    .select("is_active, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!participantDetails) {
    return false;
  }

  const details = participantDetails as ParticipantStatus;

  if (details.status === "pending" || !details.is_active) {
    return false;
  }

  return true;
};

export const hasProfileImage = async (
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from("participant_image")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
};
