import { unstable_cache } from "next/cache";
import { flattenExhibitors } from "@/lib/participants/flatten-exhibitors";
import { getExhibitorsGroupedCached } from "@/lib/participants/cached-get-exhibitors";
import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import { loadProgramListItemsCached } from "@/lib/program/cached-load-program-items";
import { POSTS_CACHE_TAG } from "@/lib/posts/revalidate-posts-cache";
import { POSTS_PAGE_CACHE_TAG } from "@/lib/posts/fetch-posts-page";
import { fetchPublishedPostSlugs } from "@/lib/posts/fetch-public-post";
import { getCachedAboutArchiveBlock } from "@/lib/about/cached-about-data";
import { ABOUT_ARCHIVE_CACHE_TAG } from "@/lib/about/about-cache-tags";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export type PublicUrlEntry = {
  path: string;
};

const fetchPublicUrlsCached = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    const grouped = await getExhibitorsGroupedCached();
    const items = flattenExhibitors(grouped);

    const exhibitorSlugs: PublicUrlEntry[] = [];
    const hubIds: PublicUrlEntry[] = [];

    for (const item of items) {
      if (item.slug) {
        exhibitorSlugs.push({ path: `/exhibitors/${item.slug}` });
        continue;
      }

      if (item.hubId) {
        hubIds.push({ path: `/exhibitors/hub/${item.hubId}` });
      }
    }

    const programItems = await loadProgramListItemsCached();
    const programEvents: PublicUrlEntry[] = programItems.map((item) => ({
      path: `/program/${item.eventId}`,
    }));

    const postSlugs = await fetchPublishedPostSlugs(supabase);
    const postPages: PublicUrlEntry[] = postSlugs.map((slug) => ({
      path: `/posts/${slug}`,
    }));

    const archiveBlock = await getCachedAboutArchiveBlock();
    const archiveYearPages: PublicUrlEntry[] = archiveBlock.years.map((year) => ({
      path: `/about/archive/${year}`,
    }));

    return { exhibitorSlugs, hubIds, programEvents, postPages, archiveYearPages };
  },
  ["public-seo-urls"],
  {
    revalidate: 3600,
    tags: ["exhibitors-page", "program-page", POSTS_CACHE_TAG, POSTS_PAGE_CACHE_TAG, ABOUT_ARCHIVE_CACHE_TAG],
  }
);

export const getAllPublicDynamicUrls = async (): Promise<PublicUrlEntry[]> => {
  const data = await fetchPublicUrlsCached();
  return [
    ...data.exhibitorSlugs,
    ...data.hubIds,
    ...data.programEvents,
    ...data.postPages,
    ...data.archiveYearPages,
  ];
};
