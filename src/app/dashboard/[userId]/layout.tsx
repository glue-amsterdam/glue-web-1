import { DashboardProvider } from "@/app/context/DashboardContext";
import RejectedAccess from "@/app/dashboard/[userId]/rejected-access";
import DashboardMenu from "@/app/dashboard/components/dashboard-menu";
import InsufficientAccess from "@/app/dashboard/insufficient-access";
import WrongCredentials from "@/app/dashboard/wrong-credentials-access";
import { NAVBAR_HEIGHT } from "@/constants";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();
  const paramsData = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const targetUserId = paramsData.userId;
  const loggedInUserId = user.id;

  const [
    visitorRowRes,
    participantDetailsRes,
    loggedUserInfoRes,
    isModerator,
  ] = await Promise.all([
    supabaseAdmin
      .from("visitor_data")
      .select(
        "id, email, first_name, last_name, display_name, full_name, auth_user_id"
      )
      .eq("auth_user_id", loggedInUserId)
      .maybeSingle(),
    supabase
      .from("participant_details")
      .select("status, is_active, slug, display_name")
      .eq("user_id", loggedInUserId)
      .maybeSingle(),
    supabase
      .from("user_info")
      .select("plan_type, user_name")
      .eq("user_id", loggedInUserId)
      .maybeSingle(),
    getIsPlatformMod(supabase, loggedInUserId),
  ]);

  const visitorRow = visitorRowRes.data;
  const participantDetails = participantDetailsRes.data;
  const loggedUserInfo = loggedUserInfoRes.data;

  const hasParticipantRow = Boolean(participantDetails);
  const isLegacyParticipant = loggedUserInfo?.plan_type === "participant";
  const isParticipant = hasParticipantRow || isLegacyParticipant;
  const canAccessDashboard =
    isModerator || isParticipant || Boolean(visitorRow);

  const displayName =
    getVisitorDisplayName(visitorRow ?? {}) ||
    participantDetails?.display_name ||
    loggedUserInfo?.user_name ||
    user.email ||
    "";

  if (!isModerator && loggedInUserId !== targetUserId) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <WrongCredentials userId={loggedInUserId} userName={displayName} />
      </section>
    );
  }

  if (!canAccessDashboard) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <InsufficientAccess
          userId={loggedInUserId}
          userName={displayName}
        />
      </section>
    );
  }

  const participantStatus = participantDetails?.status;
  const isPendingLimitedAccess =
    isParticipant && participantStatus === "pending" && !isModerator;

  if (isParticipant && participantStatus === "declined" && !isModerator) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <RejectedAccess userName={displayName} />
      </section>
    );
  }

  let targetParticipantName: string | null = null;
  let targetParticipantSlug: string | null = null;
  if (isModerator) {
    const [targetUserInfoRes, targetParticipantDetailsRes] = await Promise.all([
      supabase
        .from("user_info")
        .select("user_name")
        .eq("user_id", targetUserId)
        .maybeSingle(),
      supabase
        .from("participant_details")
        .select("slug, display_name")
        .eq("user_id", targetUserId)
        .maybeSingle(),
    ]);

    targetParticipantName =
      targetParticipantDetailsRes.data?.display_name ??
      targetUserInfoRes.data?.user_name ??
      null;
    targetParticipantSlug = targetParticipantDetailsRes.data?.slug ?? null;
  }

  const propData = {
    isMod: isModerator,
    loggedInUserId,
    targetUserId,
    loggedPlanType: loggedUserInfo?.plan_type ?? (isParticipant ? "participant" : "visitor"),
    isPendingLimitedAccess,
    displayName,
  };

  return (
    <section className="flex h-full min-h-0 flex-1 overflow-hidden">
      <DashboardMenu
        isMod={isModerator}
        isParticipant={isParticipant}
        isPendingLimitedAccess={isPendingLimitedAccess}
        userName={displayName}
        is_active={participantDetails?.is_active ?? false}
        targetUserId={targetUserId}
        targetParticipantName={targetParticipantName}
        targetParticipantSlug={targetParticipantSlug}
      />
      <DashboardProvider {...propData}>{children}</DashboardProvider>
    </section>
  );
}
