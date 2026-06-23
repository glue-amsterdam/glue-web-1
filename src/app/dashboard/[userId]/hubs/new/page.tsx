import { CreateHubClient } from "@/app/dashboard/[userId]/hubs/new/create-hub-client";
import { getHubParticipantsList } from "@/lib/hubs/get-hub-participants-list";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Create Hub");
}

export default async function NewHubPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const participantOptions = await getHubParticipantsList();

  return (
    <CreateHubClient
      targetUserId={userId}
      participantOptions={participantOptions}
    />
  );
}
