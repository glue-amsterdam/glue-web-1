import { unstable_cache } from "next/cache";
import {
  pressKitLinkSchema,
  type PressKitLink,
} from "@/schemas/mainSchema";
import { PRESS_KIT_LINKS_CACHE_TAG } from "@/lib/main/press-kit-links-cache-tags";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

const parsePressKitLinkRow = (row: {
  id?: number;
  link?: string;
  description?: string | null;
}): PressKitLink | null => {
  const parsed = pressKitLinkSchema.safeParse({
    id: row.id,
    link: row.link,
    description: row.description ?? null,
  });
  return parsed.success ? parsed.data : null;
};

const fetchPressKitLinks = async (): Promise<PressKitLink[]> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("press_kit_links")
    .select("id, link, description")
    .order("id");

  if (error) {
    console.error("[press-kit-links] fetch failed:", error);
    return [];
  }

  return (data ?? [])
    .map(parsePressKitLinkRow)
    .filter((link): link is PressKitLink => link !== null);
};

export const getCachedPressKitLinks = unstable_cache(
  fetchPressKitLinks,
  [PRESS_KIT_LINKS_CACHE_TAG],
  { tags: [PRESS_KIT_LINKS_CACHE_TAG], revalidate: 86400 }
);
