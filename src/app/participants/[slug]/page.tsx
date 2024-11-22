import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { fetchParticipant } from "@/utils/api";

export default async function ParticipantPage(props: {
  params: { slug: string };
}) {
  const { slug } = await props.params;
  const participant = await fetchParticipant(slug);

  return <ParticipantClientPage participant={participant} />;
}
