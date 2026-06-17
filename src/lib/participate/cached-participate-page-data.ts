import { unstable_cache } from "next/cache";
import { fetchParticipatePageData } from "@/lib/participate/fetch-participate-page-data";
import { PARTICIPATE_PLANS_CACHE_TAG } from "@/lib/participate/participate-cache-tags";
import type { ParticipatePageData } from "@/lib/participate/types";
import { TEXT_SECTION_REVALIDATE_SECONDS } from "@/lib/text-sections/types";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export const getCachedParticipatePageData = (): Promise<ParticipatePageData> =>
  unstable_cache(
    async (): Promise<ParticipatePageData> => {
      const supabase = createPublicSupabaseClient();
      return fetchParticipatePageData(supabase);
    },
    [PARTICIPATE_PLANS_CACHE_TAG],
    {
      tags: [PARTICIPATE_PLANS_CACHE_TAG],
      revalidate: TEXT_SECTION_REVALIDATE_SECONDS,
    }
  )();
