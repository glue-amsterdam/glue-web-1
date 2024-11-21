import { fetchParticipantBaseById } from "@/utils/api";
import ParticipantBaseDashboardForm from "@/app/dashboard/dashboard-forms/participant-base-dashboard-form";

export default async function UserDataFetch({ userId }: { userId: string }) {
  const participantBaseData = await fetchParticipantBaseById(userId);

  if (!participantBaseData) {
    return <div className="text-center p-4">No participant data found.</div>;
  }

  return (
    <ParticipantBaseDashboardForm participantBaseData={participantBaseData} />
  );
}
