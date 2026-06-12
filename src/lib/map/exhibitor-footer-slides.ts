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

export const getHubMemberSelectionKey = (member: {
  userId?: string;
  slug?: string;
}): string | undefined => member.userId ?? member.slug;

export const buildExhibitorFooterSlides = (
  location: MapLocation,
  detail: MapLocationDetail | null
): ExhibitorFooterSlide[] => {
  const detailMembers = detail?.members ?? [];
  const locationMembers = location.members ?? [];
  const hubMembers =
    detailMembers.length > 1 ? detailMembers : locationMembers;

  if (hubMembers.length > 1) {
    return hubMembers.map((member, index) => ({
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

export const findExhibitorSlideIndex = (
  slides: ExhibitorFooterSlide[],
  memberKey: string | null | undefined
): number => {
  if (!memberKey || slides.length === 0) {
    return 0;
  }

  const index = slides.findIndex((slide) => slide.id === memberKey);
  return index >= 0 ? index : 0;
};
