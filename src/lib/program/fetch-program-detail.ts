import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { getProgramDetail } from "./get-program-detail";
import {
  PROGRAM_DETAIL_CACHE_TAG,
  PROGRAM_PAGE_CACHE_TAG,
} from "./program-cache-tags";
import type { ProgramDetail } from "./program-types";

export { PROGRAM_DETAIL_CACHE_TAG } from "./program-cache-tags";

const fetchProgramDetailCached = unstable_cache(
  async (eventId: string): Promise<ProgramDetail> => {
    const supabase = createPublicSupabaseClient();
    return getProgramDetail(supabase, eventId);
  },
  [PROGRAM_DETAIL_CACHE_TAG],
  {
    tags: [PROGRAM_DETAIL_CACHE_TAG, PROGRAM_PAGE_CACHE_TAG],
    revalidate: 120,
  }
);

export const fetchProgramDetail = cache(
  async (eventId: string): Promise<ProgramDetail> =>
    fetchProgramDetailCached(eventId)
);
