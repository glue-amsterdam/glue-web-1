import { HubsClient } from "@/app/dashboard/[userId]/hubs/hubs-client";
import { getHubsSummary } from "@/lib/hubs/get-hubs-summary";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Hubs");
}

export default async function HubsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const hubs = await getHubsSummary();

  return <HubsClient targetUserId={userId} hubs={hubs} />;
}
