import { fetchParticipants } from "@/utils/api";
import { Suspense } from "react";
import CenteredLoader from "../../centered-loader";
import ParticipantsSection from "./participants-section";

async function Participants() {
  const participants = await fetchParticipants();
  return <ParticipantsSection participants={participants} />;
}

export default function ParticipantsSectionSuspense() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <Participants />
    </Suspense>
  );
}
