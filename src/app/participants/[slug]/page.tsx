import { Suspense } from "react";
import { fetchParticipant, fetchMapById } from "@/utils/api";
import CenteredLoader from "@/app/components/centered-loader";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";
import { ParticipantUser } from "@/schemas/usersSchemas";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ParticipantPage({ params }: PageProps) {
  const { slug } = await params;
  const participant: ParticipantUser = await fetchParticipant(slug);

  let mapData = null;
  if (participant && "mapId" in participant) {
    mapData = await fetchMapById(participant.mapId.id);
  }

  return (
    <Suspense fallback={<CenteredLoader />}>
      <ParticipantClientPage participant={participant} mapData={mapData} />
    </Suspense>
  );
}
