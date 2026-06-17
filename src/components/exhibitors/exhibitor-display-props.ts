import type { ExhibitorCarouselSlide } from "@/lib/participants/exhibitor-carousel-slides";
import type { ExhibitorContactInfo } from "@/lib/participants/exhibitor-detail-types";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";

export type ExhibitorDisplayProps = {
  type: ExhibitorType;
  name: string;
  carouselSlides: ExhibitorCarouselSlide[];
  displayLabel: string;
  description: string | null;
  contactInfo?: ExhibitorContactInfo;
};
