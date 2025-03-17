import { fetchParticipant } from "@/utils/api";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";

import { ParticipantClientResponse } from "@/types/api-visible-user";
import PendingParticipant from "@/app/participants/[slug]/pending-participant";
import DeclinedParticipant from "@/app/participants/[slug]/declined-participant";
import { config } from "@/env";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const participant: ParticipantClientResponse = await fetchParticipant(slug);

  const defaultImage = `${config.baseUrl}/${config.cityName}/og-image.jpg`;

  const imageUrl =
    participant.images.length > 0
      ? participant.images[0].image_url
      : defaultImage;

  return {
    title: `GLUE ${config.cityName} - ${
      participant.user_info.user_name ?? "Unknown"
    }`,
    description:
      participant.short_description ??
      `View details about ${participant.user_info.user_name}. A GLUE participant.`,
    keywords: ["GLUE", "participant", participant.user_info.user_name],
    openGraph: {
      title: `GLUE ${config.cityName} - ${
        participant.user_info.user_name ?? "Unknown"
      }`,
      description:
        participant.short_description ??
        `View details about ${participant.user_info.user_name}.A GLUE participant.`,
      url: `/participants/${slug}`,
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Profile image of ${participant.user_info.user_name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `GLUE ${config.cityName} - ${
        participant.user_info.user_name ?? "Unknown"
      }`,
      description:
        participant.short_description ??
        `View details about ${participant.user_info.user_name}.`,
      images: [imageUrl],
    },
  };
}

export default async function ParticipantPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise;
  const { slug } = params;
  const participant: ParticipantClientResponse = await fetchParticipant(slug);

  // If participant is sticky, treat them as accepted regardless of status
  if (participant.is_sticky) {
    return <ParticipantClientPage participant={participant} />;
  }

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
