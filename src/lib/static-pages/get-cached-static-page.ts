import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  STATIC_PAGE_CACHE_TAG,
  STATIC_PAGE_DEFAULTS,
  type StaticPageBlock,
  type StaticPageSlug,
} from "@/lib/static-pages/static-pages-config";

const CACHE_REVALIDATE = false as const;

const createCachedStaticPageFetcher = (slug: StaticPageSlug) =>
  unstable_cache(
    async (): Promise<StaticPageBlock> => {
      const defaults = STATIC_PAGE_DEFAULTS[slug];
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("static_content_pages")
        .select("title, subtitle, content")
        .eq("slug", slug)
        .single();

      if (error?.code === "PGRST116" || error?.code === "42P01") {
        return defaults;
      }
      if (error) throw error;

      return {
        title: data?.title ?? defaults.title,
        subtitle: data?.subtitle ?? defaults.subtitle ?? null,
        content: data?.content ?? defaults.content,
      };
    },
    [STATIC_PAGE_CACHE_TAG(slug)],
    { tags: [STATIC_PAGE_CACHE_TAG(slug)], revalidate: CACHE_REVALIDATE }
  );

const cachedFetchers: Partial<
  Record<StaticPageSlug, () => Promise<StaticPageBlock>>
> = {};

export const getCachedStaticPage = async (
  slug: StaticPageSlug
): Promise<StaticPageBlock> => {
  if (!cachedFetchers[slug]) {
    cachedFetchers[slug] = createCachedStaticPageFetcher(slug);
  }

  return cachedFetchers[slug]!();
};
