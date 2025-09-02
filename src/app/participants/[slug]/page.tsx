import { fetchParticipant } from "@/utils/api";
import ParticipantClientPage from "@/app/participants/[slug]/participants-client-page";

import { ParticipantClientResponse } from "@/types/api-visible-user";
import { config } from "@/env";
import DeclinedParticipant from "@/components/participant-page/DeclinedParticipant";
import PendingParticipant from "@/components/participant-page/PendingParticipant";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const participant: ParticipantClientResponse = await fetchParticipant(slug);

  const defaultImage = `${config.baseUrl}/${config.cityName}/og-image.jpg`;
  const imageUrl =
    participant.images.length > 0
      ? participant.images[0].image_url
      : defaultImage;

  const title = `GLUE ${config.cityName} - ${
    participant.user_info.user_name ?? "Unknown"
  }`;
  const description =
    participant.short_description ??
    `Discover ${participant.user_info.user_name} at GLUE . View details, events, and contact information.`;

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: participant.user_info.user_name,
    description: participant.short_description || participant.description,
    image: imageUrl,
    url: `${config.baseUrl}/participants/${slug}`,
    sameAs: participant.user_info.social_media
      ? [
          participant.user_info.social_media.instagramLink,
          participant.user_info.social_media.facebookLink,
          participant.user_info.social_media.linkedinLink,
        ].filter(Boolean)
      : [],
    telephone: participant.user_info.phone_numbers?.[0],
    email: participant.user_info.visible_emails?.[0],
    address: participant.user_info.map_info?.[0]
      ? {
          "@type": "PostalAddress",
          streetAddress: participant.user_info.map_info[0].formatted_address,
        }
      : undefined,
    worksFor: {
      "@type": "Organization",
      name: "GLUE ",
      url: config.baseUrl,
    },
    knowsAbout: participant.user_info.events?.map((event) => event.title) || [],
    hasOccupation: {
      "@type": "Occupation",
      name: "GLUE  Participant",
    },
  };

  return {
    title,
    description,
    keywords: [
      "GLUE ",
      participant.user_info.user_name,
      config.cityName,
      "events",
      "culture",
      "participant",
      "",
    ],
    authors: [{ name: participant.user_info.user_name }],
    creator: participant.user_info.user_name,
    publisher: "GLUE ",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${config.baseUrl}/participants/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${config.baseUrl}/participants/${slug}`,
      siteName: `GLUE ${config.cityName}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Profile image of ${participant.user_info.user_name}`,
          type: "image/jpeg",
        },
      ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@GLUE",
      site: "@GLUE",
    },
    other: {
      "application/ld+json": JSON.stringify(structuredData),
    },
  };
}

export default async function ParticipantPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise;
  const { slug } = params;
  const participant: ParticipantClientResponse = await fetchParticipant(slug);
  const hubs = await fetch(
    `${config.baseUrl}/api/participant-hubs?userId=${participant.user_id}`
  ).then((res) => res.json());

  // If participant is sticky (now determined by presence in sticky_group_participants table),
  // treat them as accepted regardless of status
  if (participant.is_sticky) {
    return <ParticipantClientPage participant={participant} hubs={hubs} />;
  }

  switch (participant.status) {
    case "pending":
      return <PendingParticipant />;
    case "declined":
      return <DeclinedParticipant />;
    case "accepted":
      return (
        <>
          <ParticipantClientPage participant={participant} hubs={hubs} />
        </>
      );
    default:
      throw new Error(`Unknown participant status: ${participant.status}`);
  }
}
