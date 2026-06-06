import { CreateHubClient } from "@/app/dashboard/[userId]/hubs/new/create-hub-client";
import { getHubParticipantsList } from "@/lib/hubs/get-hub-participants-list";

export default async function NewHubPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const userInfoList = await getHubParticipantsList();

  return (
    <CreateHubClient targetUserId={userId} userInfoList={userInfoList} />
  );
}
