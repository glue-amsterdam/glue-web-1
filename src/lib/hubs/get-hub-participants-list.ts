import type { UserInfo } from "@/schemas/userInfoSchemas";
import { createClient } from "@/utils/supabase/server";

type ParticipantDetailsRow = {
  user_id: string;
  display_name: string | null;
  visible_emails: string[] | null;
  plan_type: string | null;
  plan_id: string | null;
};

const mapParticipantToUserInfo = (row: ParticipantDetailsRow): UserInfo => ({
  id: row.user_id,
  user_id: row.user_id,
  user_name: row.display_name,
  visible_emails: row.visible_emails,
  plan_type: row.plan_type ?? "participant",
  plan_id: row.plan_id ?? "",
  is_mod: false,
});

export const getHubParticipantsList = async (): Promise<UserInfo[]> => {
  const supabase = await createClient();

  const { data: participants, error } = await supabase
    .from("participant_details")
    .select("user_id, display_name, visible_emails, plan_type, plan_id")
    .eq("status", "accepted")
    .eq("is_active", true)
    .eq("plan_type", "participant")
    .order("display_name", { ascending: true });

  if (error) {
    console.error("getHubParticipantsList participant_details:", error);
    return [];
  }

  return (participants ?? []).map(mapParticipantToUserInfo);
};
