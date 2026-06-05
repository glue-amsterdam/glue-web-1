import { getDashboardHomePath } from "@/lib/users/get-dashboard-home-path";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function UserDataLegacyRedirectPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  if (user.id !== userId) {
    redirect(getDashboardHomePath(user.id, { isParticipant: true }));
  }

  const [participantRes, userInfoRes] = await Promise.all([
    supabase
      .from("participant_details")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_info")
      .select("plan_type")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const isParticipant =
    Boolean(participantRes.data) ||
    userInfoRes.data?.plan_type === "participant";

  redirect(getDashboardHomePath(userId, { isParticipant }));
}
