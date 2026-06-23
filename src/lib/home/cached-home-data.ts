import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { fetchLatestStickyGroup } from "./fetch-sticky-group";
import { fetchLatestYearCitizens } from "./fetch-citizens";
import { fetchHomeHero } from "./fetch-home-hero";
import {
  HOME_CITIZENS_CACHE_TAG,
  HOME_HERO_REVALIDATE_SECONDS,
  HOME_STICKY_CACHE_TAG,
  HOME_VIDEO_CACHE_TAG,
  type HomeCitizensData,
  type HomeHeroData,
  type HomeStickyGroupData,
} from "./types";

export const getCachedHomeStickyGroup = unstable_cache(
  async (): Promise<HomeStickyGroupData> => {
    const supabase = createPublicSupabaseClient();
    return fetchLatestStickyGroup(supabase);
  },
  [HOME_STICKY_CACHE_TAG],
  { tags: [HOME_STICKY_CACHE_TAG], revalidate: 3600 }
);

export const getCachedHomeCitizens = unstable_cache(
  async (): Promise<HomeCitizensData> => {
    const supabase = createPublicSupabaseClient();
    return fetchLatestYearCitizens(supabase);
  },
  [HOME_CITIZENS_CACHE_TAG],
  { tags: [HOME_CITIZENS_CACHE_TAG], revalidate: 3600 }
);

export const getCachedHomeHero = unstable_cache(
  async (): Promise<HomeHeroData> => {
    const supabase = createPublicSupabaseClient();
    return fetchHomeHero(supabase);
  },
  [HOME_VIDEO_CACHE_TAG],
  {
    tags: [HOME_VIDEO_CACHE_TAG],
    revalidate: HOME_HERO_REVALIDATE_SECONDS,
  }
);
