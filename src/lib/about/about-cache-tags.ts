export const ABOUT_TEAM_CACHE_TAG = "about-block-team";
export const ABOUT_FOUNDATION_CACHE_TAG = "about-block-glue-foundation";
export const ABOUT_MISSION_CACHE_TAG = "about-block-mission-statement";
export const ABOUT_PRESS_CACHE_TAG = "about-block-press-media";
export const ABOUT_ARCHIVE_CACHE_TAG = "about-block-archive";
export const ABOUT_FAQ_CACHE_TAG = "about-block-faq";
export const ABOUT_BLOCK_ORDER_CACHE_TAG = "about-block-order";

export const aboutCitizensYearCacheTag = (year: number) =>
  `about-citizens-${year}`;

export const aboutStickyYearCacheTag = (year: number) =>
  `about-sticky-${year}`;

export const aboutArchiveYearCacheTag = (year: number) =>
  `about-archive-year-${year}`;

export const ABOUT_BLOCK_CACHE_TAGS: Record<string, string> = {
  "meet-the-team": ABOUT_TEAM_CACHE_TAG,
  "glue-foundation": ABOUT_FOUNDATION_CACHE_TAG,
  "mission-statement": ABOUT_MISSION_CACHE_TAG,
  "press-media": ABOUT_PRESS_CACHE_TAG,
  archive: ABOUT_ARCHIVE_CACHE_TAG,
  faq: ABOUT_FAQ_CACHE_TAG,
};
