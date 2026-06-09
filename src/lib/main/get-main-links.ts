import { unstable_cache } from "next/cache";
import {
  linkItemSchema,
  type LinkItem,
} from "@/schemas/mainSchema";
import { MAIN_LINKS_CACHE_TAG } from "@/lib/main/main-links-cache-tags";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

const parseMainLinkRow = (row: { platform?: string; link?: string }): LinkItem | null => {
  const parsed = linkItemSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
};

export const fetchMainLinks = async (): Promise<LinkItem[]> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("main_links")
    .select("platform, link")
    .order("id");

  if (error) {
    console.error("[main-links] fetch failed:", error);
    return [];
  }

  return (data ?? [])
    .map(parseMainLinkRow)
    .filter((link): link is LinkItem => link !== null);
};

export const getCachedMainLinks = unstable_cache(
  fetchMainLinks,
  [MAIN_LINKS_CACHE_TAG],
  { tags: [MAIN_LINKS_CACHE_TAG], revalidate: 3600 }
);
