import ParticipantCard from "@/app/components/participants/participant-card";
import { getOptimizedParticipants } from "@/utils/api";

export default async function ParticipantsList() {
  const participants = await getOptimizedParticipants();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto">
      {participants.map((participant) => (
        <ParticipantCard key={participant.userId} participant={participant} />
      ))}
    </div>
  );
}
