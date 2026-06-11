import { VisitorDataClient } from "@/app/dashboard/[userId]/visitor-data/visitor-data-client";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Visitor Profile");
}

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
