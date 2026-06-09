import { revalidatePath, revalidateTag } from "next/cache";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";
import { TEXT_SECTION_REVALIDATE_PATHS } from "./text-section-paths";
import { textSectionCacheTag } from "./types";

export const revalidateTextSectionCache = (slug: TextSectionSlug): void => {
  revalidateTag(textSectionCacheTag(slug), "max");

  const paths = TEXT_SECTION_REVALIDATE_PATHS[slug] ?? [];
  for (const path of paths) {
    revalidatePath(path);
  }
};
