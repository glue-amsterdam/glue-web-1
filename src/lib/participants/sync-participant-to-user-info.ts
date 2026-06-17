import type { SupabaseClient } from "@supabase/supabase-js";

export type ParticipantContactSyncPayload = {
  plan_id?: string | null;
  plan_type?: string | null;
  display_name?: string | null;
  phone_numbers?: string[] | null;
  social_media?: Record<string, unknown> | null;
  visible_emails?: string[] | null;
  visible_websites?: string[] | null;
  glue_communication_email?: string | null;
};

export const syncParticipantContactToUserInfo = async (
  supabase: SupabaseClient,
  userId: string,
  payload: ParticipantContactSyncPayload
): Promise<{ error: Error | null }> => {
  const updateObj: Record<string, unknown> = {};

  if (payload.plan_id != null) {
    updateObj.plan_id = payload.plan_id;
  }
  if (payload.plan_type != null) {
    updateObj.plan_type = payload.plan_type;
  }
  if (payload.display_name !== undefined) {
    updateObj.user_name = payload.display_name;
  }
  if (payload.phone_numbers !== undefined) {
    updateObj.phone_numbers = payload.phone_numbers;
  }
  if (payload.social_media !== undefined) {
    updateObj.social_media = payload.social_media;
  }
  if (payload.visible_emails !== undefined) {
    updateObj.visible_emails = payload.visible_emails;
  }
  if (payload.visible_websites !== undefined) {
    updateObj.visible_websites = payload.visible_websites;
  }
  if (payload.glue_communication_email !== undefined) {
    updateObj.glue_communication_email = payload.glue_communication_email;
  }

  if (Object.keys(updateObj).length === 0) {
    return { error: null };
  }

  const { error } = await supabase
    .from("user_info")
    .update(updateObj)
    .eq("user_id", userId);

  if (error) {
    console.error("syncParticipantContactToUserInfo:", error);
    return { error: new Error(error.message) };
  }

  return { error: null };
};

export const resolvePlanTypeFromPlanId = async (
  supabase: SupabaseClient,
  planId: string | null | undefined
): Promise<string | null> => {
  if (!planId) {
    return null;
  }

  const { data, error } = await supabase
    .from("plans")
    .select("plan_type")
    .eq("plan_id", planId)
    .maybeSingle();

  if (error || !data?.plan_type) {
    return null;
  }

  return data.plan_type as string;
};
