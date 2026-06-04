import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { fetchLatestStickyGroup } from "./fetch-sticky-group";
import { fetchLatestYearCitizens } from "./fetch-citizens";
import {
  HOME_CITIZENS_CACHE_TAG,
  HOME_STICKY_CACHE_TAG,
  HOME_VIDEO_CACHE_TAG,
  HomeVideoData,
  type HomeCitizensData,
  type HomeStickyGroupData,
} from "./types";
import { fetchHomeVideo } from "./fet-home-video";

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

export const getCachedHomeVideo = unstable_cache(
  async (): Promise<HomeVideoData> => {
    const supabase = createPublicSupabaseClient();
    return fetchHomeVideo(supabase);
  },
  [HOME_VIDEO_CACHE_TAG],
  { tags: [HOME_VIDEO_CACHE_TAG], revalidate: 3600 }
);