import {
  getCachedHomeCitizens,
  getCachedHomeHero,
  getCachedHomeStickyGroup,
} from "./cached-home-data";
import { EMPTY_HOME_CITIZENS } from "./fetch-citizens";
import { EMPTY_HOME_HERO } from "./fetch-home-hero";
import { EMPTY_STICKY_GROUP } from "./fetch-sticky-group";
import type { HomeCitizensData, HomeHeroData, HomeStickyGroupData } from "./types";

export type HomePageData = {
  stickyGroupData: HomeStickyGroupData;
  citizensData: HomeCitizensData;
  homeHeroData: HomeHeroData;
};

const loadHomeSection = async <T>(
  section: string,
  load: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await load();
  } catch (error) {
    console.error(`[home] Failed to load ${section}:`, error);
    return fallback;
  }
};

/** Loads home CMS data; failed sections fall back to empty payloads so the page still renders. */
export const loadHomePageData = async (): Promise<HomePageData> => {
  const [stickyGroupData, citizensData, homeHeroData] = await Promise.all([
    loadHomeSection("sticky group", getCachedHomeStickyGroup, EMPTY_STICKY_GROUP),
    loadHomeSection("citizens", getCachedHomeCitizens, EMPTY_HOME_CITIZENS),
    loadHomeSection("hero", getCachedHomeHero, EMPTY_HOME_HERO),
  ]);

  return { stickyGroupData, citizensData, homeHeroData };
};
