import { ABOUT_PAGE_FIXTURE } from "./about-page-fixture";
import {
  getCachedAboutArchiveBlock,
  getCachedAboutFaqBlock,
  getCachedAboutFoundationBlock,
  getCachedAboutMissionBlock,
  getCachedAboutPressBlock,
  getCachedAboutTeamBlock,
  getCachedArchiveYear,
} from "./cached-about-data";
import { buildFooterAboutLinks, buildNavbar } from "./build-navbar";
import type { FooterAboutLink } from "./build-navbar";
import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import {
  type AboutBlock,
  type AboutPageData,
  type ArchiveBlock,
  type ArchiveYearSection,
  type NewsletterBlock,
} from "@/schemas/aboutPageSchema";
import { aboutPageSchema } from "@/schemas/aboutPageSchema";

const getFixtureBlock = (id: string): AboutBlock => {
  const block = ABOUT_PAGE_FIXTURE.blocks.find((b) => b.id === id);
  if (!block) {
    throw new Error(`Fixture block not found: ${id}`);
  }
  return block;
};

const NEWSLETTER_BLOCK: NewsletterBlock = {
  id: ABOUT_BLOCK_IDS.NEWSLETTER,
  is_visible: true,
};

const loadAboutSection = async <T>(
  blockId: string,
  load: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await load();
  } catch (error) {
    console.error(`[about] Failed to load ${blockId}:`, error);
    return fallback;
  }
};

export const loadAboutPageData = async (): Promise<AboutPageData> => {
  const [
    teamBlock,
    foundationBlock,
    pressBlock,
    archiveBlock,
    faqBlock,
    missionBlock,
  ] = await Promise.all([
    loadAboutSection(
      "team",
      getCachedAboutTeamBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.TEAM)
    ),
    loadAboutSection(
      "foundation",
      getCachedAboutFoundationBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.FOUNDATION)
    ),
    loadAboutSection(
      "press",
      getCachedAboutPressBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.PRESS)
    ),
    loadAboutSection(
      "archive",
      getCachedAboutArchiveBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.ARCHIVE)
    ),
    loadAboutSection(
      "faq",
      getCachedAboutFaqBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.FAQ)
    ),
    loadAboutSection(
      "mission",
      getCachedAboutMissionBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.MISSION)
    ),
  ]);

  const archive = { ...archiveBlock } as ArchiveBlock;

  if (archive.is_visible && archive.years.length > 0) {
    const sectionResults = await Promise.all(
      archive.years.map((year) =>
        loadAboutSection(
          `archive-year-${year}`,
          () => getCachedArchiveYear(year),
          null
        )
      )
    );

    const preloadedSections = sectionResults.filter(
      (section): section is ArchiveYearSection => section != null
    );

    archive.preloaded_sections = preloadedSections;

    const defaultYear = archive.default_year ?? archive.years[0];
    archive.default_section =
      preloadedSections.find((section) => section.year === defaultYear) ??
      preloadedSections[0];
  }

  const blocks = [
    teamBlock,
    foundationBlock,
    NEWSLETTER_BLOCK,
    pressBlock,
    archive,
    faqBlock,
    missionBlock,
  ];

  const navbar = buildNavbar(blocks);

  const pageData: AboutPageData = {
    navbar,
    blocks,
  };

  return aboutPageSchema.parse(pageData);
};

export const loadFooterAboutLinks = async (): Promise<FooterAboutLink[]> => {
  const [faqBlock, pressBlock, archiveBlock] = await Promise.all([
    loadAboutSection(
      ABOUT_BLOCK_IDS.FAQ,
      getCachedAboutFaqBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.FAQ)
    ),
    loadAboutSection(
      ABOUT_BLOCK_IDS.PRESS,
      getCachedAboutPressBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.PRESS)
    ),
    loadAboutSection(
      ABOUT_BLOCK_IDS.ARCHIVE,
      getCachedAboutArchiveBlock,
      getFixtureBlock(ABOUT_BLOCK_IDS.ARCHIVE)
    ),
  ]);

  return buildFooterAboutLinks([faqBlock, pressBlock, archiveBlock]);
};
