import RejectedAccess from "@/app/dashboard/[userId]/rejected-access";
import DashboardMenu from "@/app/dashboard/components/dashboard-menu";
import DashboardPendingGate from "@/app/dashboard/components/dashboard-pending-gate";
import MainContainer from "@/components/main-container";
import { NAVBAR_HEIGHT } from "@/constants";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import {
  generateDashboardBaseMetadata,
  getDashboardSubjectProfile,
} from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId: targetUserId } = await params;
  return generateDashboardBaseMetadata(targetUserId);
}

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

  const subjectProfile = auth.isMod
    ? await getDashboardSubjectProfile(targetUserId)
    : null;

  return (
    <section className="flex h-full min-h-0 flex-1 overflow-hidden">
      <MainContainer className="flex h-full min-h-0 w-full flex-col lg:flex-row">
        <DashboardMenu
          isMod={auth.isMod}
          isParticipant={auth.isParticipant}
          isPendingLimitedAccess={auth.isPendingLimitedAccess}
          userName={auth.displayName}
          is_active={auth.is_active}
          targetUserId={targetUserId}
          loggedInUserId={auth.loggedInUserId}
          targetParticipantName={subjectProfile?.name ?? null}
          targetParticipantSlug={subjectProfile?.slug ?? null}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain py-4">
          <DashboardPendingGate
            isPendingLimitedAccess={auth.isPendingLimitedAccess}
            displayName={auth.displayName}
            targetUserId={targetUserId}
          >
            {children}
          </DashboardPendingGate>
        </div>
      </MainContainer>
    </section>
  );
}
