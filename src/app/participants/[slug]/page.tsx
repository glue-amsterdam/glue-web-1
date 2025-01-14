import { fetchParticipant } from "@/utils/api";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";

import { ParticipantClientResponse } from "@/types/api-visible-user";
import PendingParticipant from "@/app/participants/[slug]/pending-participant";
import DeclinedParticipant from "@/app/participants/[slug]/declined-participant";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParticipantPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise;
  const { slug } = params;
  const participant: ParticipantClientResponse = await fetchParticipant(slug);

  switch (participant.status) {
    case "pending":
      return <PendingParticipant />;
    case "declined":
      return <DeclinedParticipant />;
    case "accepted":
      return <ParticipantClientPage participant={participant} />;
    default:
      throw new Error(`Unknown participant status: ${participant.status}`);
  }
}
