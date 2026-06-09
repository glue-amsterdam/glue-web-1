import type { TextSectionSlug } from "@/schemas/textSectionSchema";

export const TEXT_SECTION_REVALIDATE_PATHS: Record<TextSectionSlug, string[]> = {
  "become-an-exhibitor": ["/"],
  "alternatives-unexpected": ["/", "/visit"],
  newsletter: ["/", "/visit", "/about"],
  "visit-intro": ["/visit"],
  "visit-sign-up": ["/visit"],
  "visit-discover": ["/visit"],
  "participate-intro": ["/participate"],
  "participate-how-it-works": ["/participate"],
  "participate-select-plan": ["/participate"],
};
