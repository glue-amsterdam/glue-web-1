import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { fetchParticipant } from "@/utils/api";

export default async function ParticipantPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const participant = await fetchParticipant(slug);

  return <ParticipantClientPage participant={participant} />;
}
