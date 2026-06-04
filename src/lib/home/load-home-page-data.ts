import {
  getCachedHomeCitizens,
  getCachedHomeStickyGroup,
  getCachedHomeVideo,
} from "./cached-home-data";
import { EMPTY_HOME_CITIZENS } from "./fetch-citizens";
import { EMPTY_HOME_VIDEO } from "./fet-home-video";
import { EMPTY_STICKY_GROUP } from "./fetch-sticky-group";
import type { HomeCitizensData, HomeStickyGroupData, HomeVideoData } from "./types";

export type HomePageData = {
  stickyGroupData: HomeStickyGroupData;
  citizensData: HomeCitizensData;
  homeVideoData: HomeVideoData;
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
  const [stickyGroupData, citizensData, homeVideoData] = await Promise.all([
    loadHomeSection("sticky group", getCachedHomeStickyGroup, EMPTY_STICKY_GROUP),
    loadHomeSection("citizens", getCachedHomeCitizens, EMPTY_HOME_CITIZENS),
    loadHomeSection("hero video", getCachedHomeVideo, EMPTY_HOME_VIDEO),
  ]);

  return { stickyGroupData, citizensData, homeVideoData };
};
