import { fetchParticipant } from "@/utils/api";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { ParticipantClientResponse } from "@/types/api-visible-user";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParticipantPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise;
  const { slug } = params;
  const participant: ParticipantClientResponse = await fetchParticipant(slug);

  return <ParticipantClientPage participant={participant} />;
}
