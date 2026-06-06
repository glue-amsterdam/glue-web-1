import RejectedAccess from "@/app/dashboard/[userId]/rejected-access";
import DashboardMenu from "@/app/dashboard/components/dashboard-menu";
import DashboardPendingGate from "@/app/dashboard/components/dashboard-pending-gate";
import MainContainer from "@/components/main-container";
import { NAVBAR_HEIGHT } from "@/constants";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { createClient } from "@/utils/supabase/server";
import React from "react";

export default async function DashboardLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const { userId: targetUserId } = await params;
  const auth = await getDashboardAuth(targetUserId);

  if (
    auth.isParticipant &&
    auth.participantStatus === "declined" &&
    !auth.isMod
  ) {
    return (
      <section style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}>
        <RejectedAccess userName={auth.displayName} />
      </section>
    );
  }

  let targetParticipantName: string | null = null;
  let targetParticipantSlug: string | null = null;

  if (auth.isMod) {
    const supabase = await createClient();
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

  return (
    <section className="flex h-full min-h-0 flex-1 overflow-hidden">
      <MainContainer className="flex h-full min-h-0 w-full lg:flex-row">
        <DashboardMenu
          isMod={auth.isMod}
          isParticipant={auth.isParticipant}
          isPendingLimitedAccess={auth.isPendingLimitedAccess}
          userName={auth.displayName}
          is_active={auth.is_active}
          targetUserId={targetUserId}
          loggedInUserId={auth.loggedInUserId}
          targetParticipantName={targetParticipantName}
          targetParticipantSlug={targetParticipantSlug}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain py-4">
          <DashboardPendingGate
            isPendingLimitedAccess={auth.isPendingLimitedAccess}
            displayName={auth.displayName}
          >
            {children}
          </DashboardPendingGate>
        </div>
      </MainContainer>
    </section>
  );
}
