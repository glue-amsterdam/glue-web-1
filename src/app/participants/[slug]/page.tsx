import CenteredLoader from "@/app/components/centered-loader";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { fetchParticipant } from "@/utils/api";
import { Suspense, use } from "react";

export default async function ParticipantPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const participant = use(fetchParticipant(slug));

  return (
    <Suspense fallback={<CenteredLoader />}>
      <ParticipantClientPage participant={participant} />
    </Suspense>
  );
}
