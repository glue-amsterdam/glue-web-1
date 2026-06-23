import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import type { ArchiveYearSection } from "@/schemas/aboutPageSchema";
import {
  ABOUT_ARCHIVE_CACHE_TAG,
  ABOUT_BLOCK_ORDER_CACHE_TAG,
  ABOUT_FAQ_CACHE_TAG,
  ABOUT_FOUNDATION_CACHE_TAG,
  ABOUT_MISSION_CACHE_TAG,
  ABOUT_PRESS_CACHE_TAG,
  ABOUT_TEAM_CACHE_TAG,
  aboutArchiveYearCacheTag,
} from "./about-cache-tags";
import { assembleArchiveYear } from "./assemble-archive-year";
import {
  fetchAboutArchiveBlock,
  fetchAboutBlockDisplayOrder,
  fetchAboutFaqBlock,
  fetchAboutTeamBlock,
  fetchAboutTextDualBlock,
} from "./fetch-about-blocks";

const CACHE_REVALIDATE = false as const;

export const getCachedAboutTeamBlock = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutTeamBlock(supabase);
  },
  [ABOUT_TEAM_CACHE_TAG],
  { tags: [ABOUT_TEAM_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedAboutFoundationBlock = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutTextDualBlock(supabase, ABOUT_BLOCK_IDS.FOUNDATION);
  },
  [ABOUT_FOUNDATION_CACHE_TAG],
  { tags: [ABOUT_FOUNDATION_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedAboutMissionBlock = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutTextDualBlock(supabase, ABOUT_BLOCK_IDS.MISSION);
  },
  [ABOUT_MISSION_CACHE_TAG],
  { tags: [ABOUT_MISSION_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedAboutPressBlock = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutTextDualBlock(supabase, ABOUT_BLOCK_IDS.PRESS);
  },
  [ABOUT_PRESS_CACHE_TAG],
  { tags: [ABOUT_PRESS_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedAboutFaqBlock = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutFaqBlock(supabase);
  },
  [ABOUT_FAQ_CACHE_TAG],
  { tags: [ABOUT_FAQ_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedAboutBlockDisplayOrder = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutBlockDisplayOrder(supabase);
  },
  [ABOUT_BLOCK_ORDER_CACHE_TAG],
  { tags: [ABOUT_BLOCK_ORDER_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedAboutArchiveBlock = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    return fetchAboutArchiveBlock(supabase);
  },
  [ABOUT_ARCHIVE_CACHE_TAG],
  { tags: [ABOUT_ARCHIVE_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

export const getCachedArchiveYear = (
  year: number
): Promise<ArchiveYearSection | null> => {
  const tag = aboutArchiveYearCacheTag(year);
  const cached = unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      return assembleArchiveYear(supabase, year);
    },
    [tag],
    {
      tags: [tag, ABOUT_ARCHIVE_CACHE_TAG],
      revalidate: CACHE_REVALIDATE,
    }
  );
  return cached();
};
