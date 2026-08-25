import type {
  ExhibitorHubDetail,
  ExhibitorHubMember,
  ExhibitorParticipantDetail,
} from "./exhibitor-detail-types";
import type { ExhibitorDisplayProps } from "@/components/exhibitors/exhibitor-display-props";
import type { ExhibitorItem } from "./exhibitor-types";
import { getExhibitorNumberBadges } from "./exhibitors-filters";
import { getPrimaryDisplayNumber } from "@/lib/numbers/resolve-display-number-badges";

export const toDisplayPropsFromParticipant = (
  participant: ExhibitorParticipantDetail
): ExhibitorDisplayProps => {
  const numberBadges = getExhibitorNumberBadges({
    type: participant.type,
    displayNumber: participant.displayNumber,
    hubDisplayNumber: participant.inheritedHubs?.[0]?.displayNumber ?? null,
    hubType: participant.inheritedHubs?.[0]?.type,
    inheritedHubs: participant.inheritedHubs,
    showHubNumber: participant.showHubNumber ?? true,
  });

  return {
    type: participant.type,
    name: participant.name,
    carouselSlides: participant.carouselSlides,
    displayLabel: getPrimaryDisplayNumber(numberBadges) ?? " ",
    numberBadges,
    description: participant.description,
    contactInfo: participant.contactInfo,
    navigation: participant.navigation,
  };
};

export { hubMembersToCarouselSlides } from "./exhibitor-carousel-slides";

export const toExhibitorItemFromHubMember = (
  member: ExhibitorHubMember,
  hub?: Pick<ExhibitorHubDetail, "hubDisplayNumber" | "type" | "hubId">
): ExhibitorItem => {
  const inheritedHubs =
    member.inheritedHubs && member.inheritedHubs.length > 0
      ? member.inheritedHubs
      : hub
        ? [{ displayNumber: hub.hubDisplayNumber, type: hub.type }]
        : [];

  return {
    type: member.type,
    name: member.name,
    imageUrl: member.imageUrl,
    displayNumber: member.displayNumber,
    hubDisplayNumber:
      inheritedHubs.find((item) => item.displayNumber?.trim())?.displayNumber ??
      hub?.hubDisplayNumber ??
      null,
    hubType: inheritedHubs[0]?.type ?? hub?.type,
    inheritedHubs,
    showHubNumber: member.showHubNumber ?? true,
    slug: member.slug,
    userId: member.userId,
    hubId: hub?.hubId,
  };
};
