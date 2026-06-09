import { revalidateTag } from "next/cache";
import {
  YEAR_NUMBERS_LATEST_CACHE_TAG,
  yearNumbersYearCacheTag,
} from "./year-numbers-cache-tags";

export const revalidateYearNumbersCache = (year: number): void => {
  revalidateTag(yearNumbersYearCacheTag(year), "max");
  revalidateTag(YEAR_NUMBERS_LATEST_CACHE_TAG, "max");
};
