import type {
  TextSectionAdminGroup,
  TextSectionSlug,
  TextSectionVariant,
} from "@/schemas/textSectionSchema";

export const TEXT_SECTION_REVALIDATE_SECONDS = 5_184_000;

export type TextSectionData = {
  slug: TextSectionSlug;
  adminGroup: TextSectionAdminGroup;
  variant: TextSectionVariant;
  title: string;
  description: string;
  showButton: boolean;
  buttonLabel: string | null;
  buttonLink: string | null;
  sectionId: string;
};

export const textSectionCacheTag = (slug: TextSectionSlug): string =>
  `text-section-${slug}`;
