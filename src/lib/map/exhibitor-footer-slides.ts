import { getMapLocationProfileLink } from "./map-location-profile-link";
import type {
  MapLocation,
  MapLocationDetail,
  MapLocationDetailMember,
} from "./types";

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

const mergeHubMembersWithDetail = (
  locationMembers: MapLocationDetailMember[],
  detailMembers: MapLocationDetailMember[]
): MapLocationDetailMember[] => {
  if (locationMembers.length <= 1) {
    return detailMembers.length > 1 ? detailMembers : locationMembers;
  }

  if (detailMembers.length === 0) {
    return locationMembers;
  }

  const detailByUserId = new Map(
    detailMembers
      .filter((member) => member.userId)
      .map((member) => [member.userId!, member])
  );
  const detailBySlug = new Map(
    detailMembers
      .filter((member) => member.slug)
      .map((member) => [member.slug!, member])
  );

  return locationMembers.map((member) => {
    const detailMember =
      (member.userId ? detailByUserId.get(member.userId) : undefined) ??
      (member.slug ? detailBySlug.get(member.slug) : undefined);

    if (!detailMember) {
      return member;
    }

    return {
      ...member,
      name: detailMember.name ?? member.name,
      imageUrl: detailMember.imageUrl ?? member.imageUrl,
    };
  });
};

export const buildExhibitorFooterSlides = (
  location: MapLocation,
  detail: MapLocationDetail | null
): ExhibitorFooterSlide[] => {
  const detailMembers = detail?.members ?? [];
  const locationMembers = location.members ?? [];
  const hubMembers = mergeHubMembersWithDetail(locationMembers, detailMembers);
  const hubProfileHref =
    getMapLocationProfileLink(location) ?? detail?.profileHref ?? null;

  if (hubMembers.length > 1) {
    return hubMembers.map((member, index) => ({
      id: buildSlideId(member, index),
      name: member.name,
      imageUrl: member.imageUrl ?? null,
      profileHref: hubProfileHref,
    }));
  }

  const profileHref = hubProfileHref;

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
