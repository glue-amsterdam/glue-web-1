import ParticipantCard from "@/app/components/participants/participant-card";
import { fetchParticipants } from "@/lib/client/fetch-participants";

export default async function ParticipantsList() {
  const participants = await fetchParticipants();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 about-w mx-auto">
      {participants.map((participant) => (
        <ParticipantCard key={participant.user_id} participant={participant} />
      ))}
    </div>
  );
}
