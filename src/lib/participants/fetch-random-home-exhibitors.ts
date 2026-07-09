import { unstable_cache } from "next/cache";
import type { ExhibitorItem } from "@/lib/participants/exhibitor-types";
import { applyExhibitorsFilters } from "@/lib/participants/exhibitors-filter";
import { flattenExhibitors } from "@/lib/participants/flatten-exhibitors";
import { getExhibitorsGroupedCached } from "@/lib/participants/cached-get-exhibitors";
import { shuffleExhibitors } from "@/lib/participants/shuffle-exhibitors";

export const HOME_EXHIBITORS_LIMIT = 6;
export const HOME_EXHIBITORS_RANDOM_CACHE_TAG = "home-exhibitors-random";

const fetchRandomHomeExhibitorsCached = unstable_cache(
  async (): Promise<ExhibitorItem[]> => {
    const grouped = await getExhibitorsGroupedCached();

    const items = applyExhibitorsFilters(flattenExhibitors(grouped), {
      type: "all",
      sort: "displayNumber",
      order: "asc",
      q: "",
    });

    return shuffleExhibitors(items).slice(0, HOME_EXHIBITORS_LIMIT);
  },
  [HOME_EXHIBITORS_RANDOM_CACHE_TAG],
  { tags: [HOME_EXHIBITORS_RANDOM_CACHE_TAG], revalidate: 60 }
);

export const fetchRandomHomeExhibitors = (): Promise<ExhibitorItem[]> =>
  fetchRandomHomeExhibitorsCached();
