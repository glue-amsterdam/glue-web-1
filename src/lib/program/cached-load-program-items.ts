import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  PROGRAM_PAGE_CACHE_TAG,
  PROGRAM_RAW_CACHE_TAG,
} from "./program-cache-tags";
import { loadProgramListItems } from "./get-program-events";
import type { ProgramListItem } from "./program-types";

export { PROGRAM_RAW_CACHE_TAG } from "./program-cache-tags";

export const loadProgramListItemsCached = unstable_cache(
  async (): Promise<ProgramListItem[]> => {
    const supabase = createPublicSupabaseClient();
    return loadProgramListItems(supabase, {});
  },
  [PROGRAM_RAW_CACHE_TAG],
  {
    tags: [PROGRAM_PAGE_CACHE_TAG, PROGRAM_RAW_CACHE_TAG],
    revalidate: 60,
  }
);
