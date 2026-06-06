import { EditHubForm } from "@/app/dashboard/[userId]/hubs/[hubId]/edit-hub-form";
import { getHubById } from "@/lib/hubs/get-hub-by-id";
import { getHubParticipantsList } from "@/lib/hubs/get-hub-participants-list";
import { notFound } from "next/navigation";

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
