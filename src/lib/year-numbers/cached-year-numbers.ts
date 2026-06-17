import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  fetchLatestYearNumbers,
  type LatestYearNumbersData,
} from "./fetch-latest-year-numbers";
import {
  fetchYearNumbersForYear,
  type YearNumberItem,
} from "./fetch-year-numbers-for-year";
import {
  YEAR_NUMBERS_LATEST_CACHE_TAG,
  yearNumbersYearCacheTag,
} from "./year-numbers-cache-tags";

const CACHE_REVALIDATE = false as const;
const LATEST_CACHE_REVALIDATE = 3600;

export const getCachedYearNumbersForYear = (
  year: number
): Promise<YearNumberItem[]> => {
  const tag = yearNumbersYearCacheTag(year);
  const cached = unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      return fetchYearNumbersForYear(supabase, year);
    },
    [tag],
    { tags: [tag], revalidate: CACHE_REVALIDATE }
  );
  return cached();
};

export const getCachedLatestYearNumbers =
  (): Promise<LatestYearNumbersData> => {
    const cached = unstable_cache(
      async () => {
        const supabase = createPublicSupabaseClient();
        return fetchLatestYearNumbers(supabase);
      },
      [YEAR_NUMBERS_LATEST_CACHE_TAG],
      {
        tags: [YEAR_NUMBERS_LATEST_CACHE_TAG],
        revalidate: LATEST_CACHE_REVALIDATE,
      }
    );
    return cached();
  };
