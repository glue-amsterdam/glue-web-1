import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  EXHIBITORS_PAGE_CACHE_TAG,
  EXHIBITORS_RAW_CACHE_TAG,
} from "./exhibitors-cache-tags";
import type { ExhibitorsGroupedResponse } from "./exhibitor-types";
import { getExhibitors } from "./get-exhibitors";

export { EXHIBITORS_RAW_CACHE_TAG } from "./exhibitors-cache-tags";

export const getExhibitorsGroupedCached = unstable_cache(
  async (): Promise<ExhibitorsGroupedResponse> => {
    const supabase = createPublicSupabaseClient();
    return getExhibitors(supabase);
  },
  [EXHIBITORS_RAW_CACHE_TAG],
  {
    tags: [EXHIBITORS_PAGE_CACHE_TAG, EXHIBITORS_RAW_CACHE_TAG],
    revalidate: 60,
  }
);
