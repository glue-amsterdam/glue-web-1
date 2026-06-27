import { toMediaUrl } from "@/lib/media/media-url";
import type { ExhibitorHubMember } from "./exhibitor-detail-types";

export type ExhibitorCarouselSlide = {
  id: string;
  label: string;
  imageUrl: string;
};

export const hubMembersToCarouselSlides = (
  members: ExhibitorHubMember[]
): ExhibitorCarouselSlide[] =>
  members.map((member) => ({
    id: member.userId,
    label: member.name,
    imageUrl: member.imageUrl,
  }));

export const participantImagesToCarouselSlides = (
  userId: string,
  name: string,
  images: { id: string | number; image_url: string }[],
  placeholderUrl: string
): ExhibitorCarouselSlide[] => {
  if (images.length === 0) {
    return [
      {
        id: `${userId}-placeholder`,
        label: name,
        imageUrl: placeholderUrl,
      },
    ];
  }

  if (images.length === 1) {
    return [
      {
        id: String(images[0].id),
        label: name,
        imageUrl: toMediaUrl(images[0].image_url) ?? placeholderUrl,
      },
    ];
  }

  return images.map((image, index) => ({
    id: String(image.id),
    label: `${name} — image ${index + 1}`,
    imageUrl: toMediaUrl(image.image_url) ?? placeholderUrl,
  }));
};
