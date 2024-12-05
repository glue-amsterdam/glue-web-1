import { Suspense } from "react";
import { fetchParticipant, fetchMapById } from "@/utils/api";
import CenteredLoader from "@/app/components/centered-loader";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { ParticipantUser } from "@/schemas/usersSchemas";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParticipantPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise; // Await the promise
  const { slug } = params;
  const participant: ParticipantUser = await fetchParticipant(slug);

  let mapData = null;
  if (participant && "map_id" in participant && participant.map_id?.id) {
    mapData = await fetchMapById(participant.map_id.id);
  }

  return (
    <Suspense fallback={<CenteredLoader />}>
      <ParticipantClientPage participant={participant} mapData={mapData} />
    </Suspense>
  );
}
