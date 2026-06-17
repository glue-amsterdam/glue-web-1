import { EditHubForm } from "@/app/dashboard/[userId]/hubs/[hubId]/edit-hub-form";
import { getHubById } from "@/lib/hubs/get-hub-by-id";
import { getHubParticipantsList } from "@/lib/hubs/get-hub-participants-list";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string; hubId: string }>;
}): Promise<Metadata> {
  const { userId, hubId } = await params;
  const hub = await getHubById(hubId);
  return generateDashboardSectionMetadata(userId, hub?.name ?? "Edit Hub");
}

export default async function EditHubPage({
  params,
}: {
  params: Promise<{ userId: string; hubId: string }>;
}) {
  const { userId, hubId } = await params;

  const [hub, userInfoList] = await Promise.all([
    getHubById(hubId),
    getHubParticipantsList(),
  ]);

  if (!hub) {
    notFound();
  }

  return (
    <EditHubForm
      hub={hub}
      targetUserId={userId}
      userInfoList={userInfoList}
    />
  );
}
