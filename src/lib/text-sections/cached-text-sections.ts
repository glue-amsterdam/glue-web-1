import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";
import { fetchTextSection } from "./fetch-text-section";
import {
  TEXT_SECTION_REVALIDATE_SECONDS,
  textSectionCacheTag,
  type TextSectionData,
} from "./types";

export const getCachedTextSection = (
  slug: TextSectionSlug
): Promise<TextSectionData> =>
  unstable_cache(
    async (): Promise<TextSectionData> => {
      const supabase = createPublicSupabaseClient();
      return fetchTextSection(supabase, slug);
    },
    [textSectionCacheTag(slug)],
    {
      tags: [textSectionCacheTag(slug)],
      revalidate: TEXT_SECTION_REVALIDATE_SECONDS,
    }
  )();
