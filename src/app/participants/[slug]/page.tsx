import CenteredLoader from "@/app/components/centered-loader";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { fetchParticipant } from "@/utils/api";
import { Suspense, use } from "react";

export default async function ParticipantPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const { slug } = params;
  const participant = use(fetchParticipant(slug));

  return (
    <Suspense fallback={<CenteredLoader />}>
      <ParticipantClientPage participant={participant} />
    </Suspense>
  );
}
