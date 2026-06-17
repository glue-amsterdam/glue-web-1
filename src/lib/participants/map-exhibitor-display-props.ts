import type {
  ExhibitorHubMember,
  ExhibitorParticipantDetail,
} from "./exhibitor-detail-types";
import type { ExhibitorDisplayProps } from "@/components/exhibitors/exhibitor-display-props";
import type { ExhibitorItem } from "./exhibitor-types";

export const toDisplayPropsFromParticipant = (
  participant: ExhibitorParticipantDetail
): ExhibitorDisplayProps => ({
  type: participant.type,
  name: participant.name,
  carouselSlides: participant.carouselSlides,
  displayLabel: participant.displayNumber ?? " ",
  description: participant.description,
  contactInfo: participant.contactInfo,
});

export { hubMembersToCarouselSlides } from "./exhibitor-carousel-slides";

export const toExhibitorItemFromHubMember = (
  member: ExhibitorHubMember
): ExhibitorItem => ({
  type: member.type,
  name: member.name,
  imageUrl: member.imageUrl,
  displayNumber: member.displayNumber,
  hubDisplayNumber: null,
  slug: member.slug,
  userId: member.userId,
});
