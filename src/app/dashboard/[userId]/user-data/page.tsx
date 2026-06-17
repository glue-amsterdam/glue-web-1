import { getDashboardHomePath } from "@/lib/users/get-dashboard-home-path";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

const showLegacyRedirect = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "User Data");
}

export default async function UserDataLegacyRedirectPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  if (showLegacyRedirect) {
    return notFound();
  }
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
