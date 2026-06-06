import type { UserInfo } from "@/schemas/userInfoSchemas";
import { createClient } from "@/utils/supabase/server";

export const getHubParticipantsList = async (): Promise<UserInfo[]> => {
  const supabase = await createClient();

  const { data: acceptedParticipants, error: participantError } =
    await supabase
      .from("participant_details")
      .select("user_id")
      .eq("status", "accepted")
      .eq("is_active", true);

  if (participantError) {
    console.error("getHubParticipantsList participant_details:", participantError);
    return [];
  }

  if (!acceptedParticipants?.length) {
    return [];
  }

  const acceptedUserIds = acceptedParticipants.map((p) => p.user_id);

  const { data: usersInfo, error: usersError } = await supabase
    .from("user_info")
    .select("id, user_id, user_name, visible_emails, plan_type")
    .in("user_id", acceptedUserIds)
    .order("user_name", { ascending: true });

  if (usersError) {
    console.error("getHubParticipantsList user_info:", usersError);
    return [];
  }

  return (usersInfo ?? []) as UserInfo[];
};
