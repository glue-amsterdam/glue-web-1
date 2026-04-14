import { DashboardProvider } from "@/app/context/DashboardContext";
import PendingApproval from "@/app/dashboard/[userId]/pending-approval";
import RejectedAccess from "@/app/dashboard/[userId]/rejected-access";
import DashboardMenu from "@/app/dashboard/components/dashboard-menu";
import InsufficientAccess from "@/app/dashboard/insufficient-access";
import WrongCredentials from "@/app/dashboard/wrong-credentials-access";
import { NAVBAR_HEIGHT } from "@/constants";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const visitorToken = cookieStore.get("visitor_token")?.value?.trim();

  let visitor: { id: string; full_name: string; email: string } | null = null;
  if (visitorToken) {
    const { data: visitorData } = await supabaseAdmin
      .from("visitor_data")
      .select("id, full_name, email, email_verified")
      .eq("visitor_token", visitorToken)
      .maybeSingle();

    if (visitorData?.email_verified) {
      visitor = {
        id: visitorData.id,
        full_name: visitorData.full_name,
        email: visitorData.email,
      };
    }
  }

  if (!user && !visitor) redirect("/");

  const isVisitor = !user && Boolean(visitor);

  const targetUserId = paramsData.userId;
  const loggedInUserId = user?.id ?? visitor?.id ?? "";

  if (isVisitor) {
    const propData = {
      isMod: false,
      loggedInUserId,
      targetUserId,
      loggedPlanType: "visitor",
    };

    return (
      <section className="flex flex-1 min-h-0">
        <DashboardMenu
          isMod={false}
          isVisitor={true}
          userName={visitor?.full_name || visitor?.email}
          is_active={true}
          targetUserId={targetUserId}
        />
        <DashboardProvider {...propData}>{children}</DashboardProvider>
      </section>
    );
  }

  const { data: loggedUserInfo } = await supabase
    .from("user_info")
    .select("is_mod, plan_type, user_name")
    .eq("user_id", loggedInUserId)
    .single();

  const isModerator = loggedUserInfo?.is_mod || false;
  const isParticipant = loggedUserInfo?.plan_type === "participant";
  const isTargetUserSameAsLoggedInUser = loggedInUserId === targetUserId;

  const { data: participantDetails } = await supabase
    .from("participant_details")
    .select("status, is_active")
    .eq("user_id", loggedInUserId)
    .single();

  const participantStatus = participantDetails?.status;

  // When mod is viewing a profile, fetch target's user_name and slug for display (including own profile)
  let targetParticipantName: string | null = null;
  let targetParticipantSlug: string | null = null;
  if (isModerator) {
    const [targetUserInfoRes, targetParticipantDetailsRes] = await Promise.all([
      supabase
        .from("user_info")
        .select("user_name")
        .eq("user_id", targetUserId)
        .single(),
      supabase
        .from("participant_details")
        .select("slug")
        .eq("user_id", targetUserId)
        .single(),
    ]);

    targetParticipantName = targetUserInfoRes.data?.user_name ?? null;
    targetParticipantSlug = targetParticipantDetailsRes.data?.slug ?? null;
  }

  // If user is not a moderator and not a participant, show insufficient access
  if (!isModerator && !isParticipant) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <InsufficientAccess
          userId={loggedInUserId}
          userName={user?.email || loggedUserInfo?.user_name || ""}
        />
      </section>
    );
  }

  // If user is a participant but status is pending
  if (isParticipant && participantStatus === "pending" && !isModerator) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <PendingApproval
          userName={user?.email || loggedUserInfo?.user_name || ""}
        />
      </section>
    );
  }

  // If user is a participant but status is rejected
  if (isParticipant && participantStatus === "declined" && !isModerator) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <RejectedAccess
          userName={user?.email || loggedUserInfo?.user_name || ""}
        />
      </section>
    );
  }

  // If user is a participant but trying to access someone else's dashboard and is not a moderator
  if (isParticipant && !isTargetUserSameAsLoggedInUser && !isModerator) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <WrongCredentials
          userId={loggedInUserId}
          userName={user?.email || loggedUserInfo?.user_name || ""}
        />
      </section>
    );
  }

  const propData = {
    isMod: isModerator,
    loggedInUserId: loggedInUserId,
    targetUserId,
    loggedPlanType: loggedUserInfo?.plan_type,
  };

  return (
    <section className="flex h-full min-h-0 flex-1 overflow-hidden">
      <DashboardMenu
        isMod={isModerator}
        userName={loggedUserInfo?.user_name}
        is_active={participantDetails?.is_active}
        targetUserId={targetUserId}
        targetParticipantName={targetParticipantName}
        targetParticipantSlug={targetParticipantSlug}
      />
      <DashboardProvider {...propData}>{children}</DashboardProvider>
    </section>
  );
}
