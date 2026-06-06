import { HubsClient } from "@/app/dashboard/[userId]/hubs/hubs-client";
import { getHubsSummary } from "@/lib/hubs/get-hubs-summary";

export default async function HubsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const hubs = await getHubsSummary();

  return <HubsClient targetUserId={userId} hubs={hubs} />;
}
