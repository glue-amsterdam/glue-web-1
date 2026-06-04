import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import { getMapLocationProfileLink } from "./map-location-profile-link";
import type { MapLocation, MapLocationDetail } from "./types";

export type ExhibitorFooterSlide = {
  id: string;
  name: string;
  imageUrl: string | null;
  profileHref: string | null;
};

const buildSlideId = (member: { slug?: string; userId?: string; name: string }, index: number) =>
  member.userId ?? member.slug ?? `${member.name}-${index}`;

export const buildExhibitorFooterSlides = (
  location: MapLocation,
  detail: MapLocationDetail | null
): ExhibitorFooterSlide[] => {
  const detailMembers = detail?.members ?? [];
  const locationMembers = location.members ?? [];

  if (detailMembers.length > 1) {
    return detailMembers.map((member, index) => ({
      id: buildSlideId(member, index),
      name: member.name,
      imageUrl: member.imageUrl ?? null,
      profileHref: getExhibitorLink({ slug: member.slug }),
    }));
  }

  if (locationMembers.length > 1 && !detail) {
    return locationMembers.map((member, index) => ({
      id: buildSlideId(member, index),
      name: member.name,
      imageUrl: member.imageUrl ?? null,
      profileHref: getExhibitorLink({ slug: member.slug }),
    }));
  }

  const profileHref =
    getMapLocationProfileLink(location) ?? detail?.profileHref ?? null;

  return [
    {
      id: location.id,
      name: location.name,
      imageUrl: detail?.imageUrl ?? null,
      profileHref,
    },
  ];
};
