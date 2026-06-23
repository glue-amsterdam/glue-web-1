import { unstable_cache } from "next/cache";
import { flattenExhibitors } from "@/lib/participants/flatten-exhibitors";
import { getExhibitors } from "@/lib/participants/get-exhibitors";
import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import { loadProgramListItems } from "@/lib/program/get-program-events";
import { POSTS_CACHE_TAG } from "@/lib/posts/revalidate-posts-cache";
import { fetchPublishedPostSlugs } from "@/lib/posts/fetch-public-post";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export type PublicUrlEntry = {
  path: string;
};

const fetchPublicUrlsCached = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    const grouped = await getExhibitors(supabase);
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

    const programItems = await loadProgramListItems(supabase, {});
    const programEvents: PublicUrlEntry[] = programItems.map((item) => ({
      path: `/program/${item.eventId}`,
    }));

    const postSlugs = await fetchPublishedPostSlugs(supabase);
    const postPages: PublicUrlEntry[] = postSlugs.map((slug) => ({
      path: `/posts/${slug}`,
    }));

    return { exhibitorSlugs, hubIds, programEvents, postPages };
  },
  ["public-seo-urls"],
  {
    revalidate: 3600,
    tags: ["exhibitors-page", "program-page", POSTS_CACHE_TAG],
  }
);

export const getAllPublicDynamicUrls = async (): Promise<PublicUrlEntry[]> => {
  const data = await fetchPublicUrlsCached();
  return [
    ...data.exhibitorSlugs,
    ...data.hubIds,
    ...data.programEvents,
    ...data.postPages,
  ];
};
