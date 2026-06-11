import { unstable_cache } from "next/cache";
import {
  DEFAULT_SITE_THEME,
  mapSiteThemeFromRow,
  type MainColorsDbRow,
} from "@/lib/main/map-main-colors-row";
import { mapHomeTextsFromRows } from "@/lib/main/map-home-text-row";
import { SITE_THEME_CACHE_TAG } from "@/lib/main/site-theme-cache-tags";
import type { NavMenuItem } from "@/lib/nav/build-navbar-links";
import type { HomeTextItem } from "@/schemas/mainSchema";
import type { SiteThemeColors } from "@/schemas/mainSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

const CACHE_REVALIDATE = false as const;

export type SiteTheme = SiteThemeColors & {
  navMenu: NavMenuItem[];
  homeTexts: HomeTextItem[];
};


const buildFallbackSiteTheme = (): SiteTheme => ({
  ...DEFAULT_SITE_THEME,
  navMenu: [],
  homeTexts: [],
});

export const getCachedSiteTheme = unstable_cache(
  async (): Promise<SiteTheme> => {
    try {
      const supabase = createPublicSupabaseClient();

      const [
        { data: colorsRow, error: colorsError },
        { data: menuRows, error: menuError },
        { data: homeTextRows, error: homeTextError },
      ] = await Promise.all([
        supabase.from("main_colors").select("*").eq("id", 1).single(),
        supabase.from("main_menu").select("section, label, className"),
        supabase
          .from("home_text")
          .select("id, label, color, href, placement, sort_order")
          .order("sort_order"),
      ]);

      if (colorsError) {
        console.error("Error fetching cached site theme colors:", colorsError);
      }

      if (menuError) {
        console.error("Error fetching cached nav menu:", menuError);
      }

      if (homeTextError) {
        console.error("Error fetching cached home texts:", homeTextError);
      }

      const siteColors = colorsRow
        ? mapSiteThemeFromRow(colorsRow as MainColorsDbRow)
        : DEFAULT_SITE_THEME;

      return {
        ...siteColors,
        navMenu: (menuRows ?? []).map((item) => ({
          section: item.section,
          label: item.label,
          className: item.className,
        })),
        homeTexts: mapHomeTextsFromRows(homeTextRows),
      };
    } catch (error) {
      console.error("Error in getCachedSiteTheme:", error);
      return buildFallbackSiteTheme();
    }
  },
  [SITE_THEME_CACHE_TAG],
  { tags: [SITE_THEME_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);
