import { config } from "@/config";
import { stripHtmlTags } from "@/lib/sanitize-html";
import type { ExhibitorHubDetail, ExhibitorParticipantDetail } from "@/lib/participants/exhibitor-detail-types";
import type { ExhibitorItem } from "@/lib/participants/exhibitor-types";
import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import type { MapLocation } from "@/lib/map/types";
import { getMapLocationProfileLink } from "@/lib/map/map-location-profile-link";
import type { PublicPost } from "@/schemas/postSchema";
import type { ProgramDetail, ProgramListItem } from "@/lib/program/program-types";

const buildSameAs = (social: ExhibitorParticipantDetail["contactInfo"]["socialMedia"]) =>
  social
    ? [social.instagramLink, social.facebookLink, social.linkedinLink].filter(
        (link): link is string => Boolean(link)
      )
    : [];

export const buildExhibitorPersonJsonLd = (
  exhibitor: ExhibitorParticipantDetail
) => {
  const mapInfo = exhibitor.contactInfo.mapInfo[0];

  return {
    "@context": "https://schema.org",
    "@type": exhibitor.type === "special-program" ? "Organization" : "Person",
    name: exhibitor.name,
    description: stripHtmlTags(exhibitor.description ?? ""),
    image: exhibitor.imageUrl,
    url: `${config.baseUrl}/exhibitors/${exhibitor.slug}`,
    sameAs: buildSameAs(exhibitor.contactInfo.socialMedia),
    telephone: exhibitor.contactInfo.phoneNumbers?.[0],
    email: exhibitor.contactInfo.visibleEmails?.[0],
    ...(mapInfo && !mapInfo.no_address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: mapInfo.formatted_address,
          },
        }
      : {}),
    worksFor: {
      "@type": "Organization",
      name: `GLUE ${config.cityName}`,
      url: config.baseUrl,
    },
  };
};

export const buildExhibitorHubJsonLd = (hub: ExhibitorHubDetail) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: hub.name,
  description: stripHtmlTags(hub.description ?? ""),
  url: `${config.baseUrl}/exhibitors/hub/${hub.hubId}`,
  member: hub.members.map((member) => ({
    "@type": "Person",
    name: member.name,
    url: `${config.baseUrl}/exhibitors/${member.slug}`,
  })),
});

export const buildProgramEventJsonLd = (event: ProgramDetail) => {
  const startDate =
    event.date.date && event.startTime
      ? `${event.date.date}T${event.startTime}`
      : undefined;
  const endDate =
    event.date.date && event.endTime
      ? `${event.date.date}T${event.endTime}`
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: stripHtmlTags(event.description),
    startDate,
    endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: event.eventImg || `${config.baseUrl}/${config.cityName}/og-image.jpg`,
    url: `${config.baseUrl}/program/${event.eventId}`,
    organizer: {
      "@type": "Organization",
      name: event.organizer.userName,
      url: event.organizer.slug
        ? `${config.baseUrl}/exhibitors/${event.organizer.slug}`
        : config.baseUrl,
    },
    ...(event.location
      ? {
          location: {
            "@type": "Place",
            name: event.location.formattedAddress,
            address: event.location.formattedAddress,
          },
        }
      : {}),
  };
};

const buildItemListElement = (url: string, name: string) => ({
  "@type": "ListItem",
  item: {
    "@type": "WebPage",
    name,
    url: `${config.baseUrl}${url}`,
  },
});

export const buildExhibitorsCollectionJsonLd = (items: ExhibitorItem[]) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: `GLUE ${config.cityName} Exhibitors`,
      url: `${config.baseUrl}/exhibitors`,
    },
    {
      "@type": "ItemList",
      itemListElement: items
        .map((item) => {
          const url = getExhibitorLink(item);
          if (!url) {
            return null;
          }

          return buildItemListElement(url, item.name);
        })
        .filter(Boolean),
    },
  ],
});

export const buildProgramCollectionJsonLd = (items: ProgramListItem[]) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: `GLUE ${config.cityName} Program`,
      url: `${config.baseUrl}/program`,
    },
    {
      "@type": "ItemList",
      itemListElement: items.map((item) =>
        buildItemListElement(`/program/${item.eventId}`, item.name)
      ),
    },
  ],
});

export const buildMapPageJsonLd = (locations: MapLocation[]) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: `GLUE ${config.cityName} Map`,
      url: `${config.baseUrl}/map`,
      description: `Explore the GLUE ${config.cityName} design route map — find exhibitors, hubs, and curated routes.`,
    },
    {
      "@type": "ItemList",
      itemListElement: locations
        .map((location) => {
          const url = getMapLocationProfileLink(location);
          if (!url) {
            return null;
          }

          return buildItemListElement(url, location.name);
        })
        .filter(Boolean),
    },
  ],
});

export const buildPostArticleJsonLd = (post: PublicPost) => {
  const imageUrl =
    post.media.find((item) => item.image_url)?.image_url ??
    `${config.baseUrl}/${config.cityName}/og-image.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || stripHtmlTags(post.content_html),
    image: imageUrl,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    keywords: post.keywords.join(", "),
    url: `${config.baseUrl}/posts/${post.slug}`,
    ...(post.author
      ? {
          author: {
            "@type": "Person",
            name: post.author,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: `GLUE ${config.cityName}`,
      url: config.baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${config.baseUrl}/posts/${post.slug}`,
    },
  };
};

export const buildPostsCollectionJsonLd = (
  posts: Pick<PublicPost, "title" | "slug">[]
) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: `GLUE ${config.cityName} Posts`,
      url: `${config.baseUrl}/posts`,
    },
    {
      "@type": "ItemList",
      itemListElement: posts.map((post) =>
        buildItemListElement(`/posts/${post.slug}`, post.title)
      ),
    },
  ],
});
