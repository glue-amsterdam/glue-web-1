import { ParticipantDetailsClient } from "@/app/dashboard/[userId]/participant-details/participant-details-client";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { getParticipantProfileData } from "@/lib/dashboard/get-participant-profile-data";
import { getCachedPressKitLinks } from "@/lib/main/get-press-kit-links";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Participant Profile");
}

export default async function ParticipantDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const { isMod } = await getDashboardAuth(userId);
  const [profileData, pressKitLinks] = await Promise.all([
    getParticipantProfileData(userId, {
      includePlans: isMod,
    }),
    getCachedPressKitLinks(),
  ]);

  return (
    <ParticipantDetailsClient
      targetUserId={userId}
      isMod={isMod}
      profileData={profileData}
      pressKitLinks={pressKitLinks}
    />
  );
}
