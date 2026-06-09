import { ParticipantDetailsClient } from "@/app/dashboard/[userId]/participant-details/participant-details-client";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { getParticipantProfileData } from "@/lib/dashboard/get-participant-profile-data";

export default async function ParticipantDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const { isMod } = await getDashboardAuth(userId);
  const profileData = await getParticipantProfileData(userId, {
    includePlans: isMod,
  });

  return (
    <ParticipantDetailsClient
      targetUserId={userId}
      isMod={isMod}
      profileData={profileData}
    />
  );
}
