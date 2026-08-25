import type { ExhibitorCarouselSlide } from "@/lib/participants/exhibitor-carousel-slides";
import type {
  ExhibitorContactInfo,
  ExhibitorDetailNavigation,
} from "@/lib/participants/exhibitor-detail-types";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { DisplayNumberBadge } from "@/lib/numbers/resolve-display-number-badges";

export type ExhibitorDisplayProps = {
  type: ExhibitorType;
  name: string;
  carouselSlides: ExhibitorCarouselSlide[];
  displayLabel: string;
  numberBadges: DisplayNumberBadge[];
  description: string | null;
  contactInfo?: ExhibitorContactInfo;
  navigation: ExhibitorDetailNavigation;
};
