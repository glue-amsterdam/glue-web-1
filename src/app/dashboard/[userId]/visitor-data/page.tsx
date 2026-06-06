import { VisitorDataClient } from "@/app/dashboard/[userId]/visitor-data/visitor-data-client";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";

export default async function VisitorDataPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { isMod, loggedInUserId } = await getDashboardAuth(userId);

  return (
    <VisitorDataClient
      targetUserId={userId}
      loggedInUserId={loggedInUserId}
      isMod={isMod}
    />
  );
}
