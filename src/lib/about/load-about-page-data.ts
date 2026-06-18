import { ABOUT_PAGE_FIXTURE } from "./about-page-fixture";
import {
  getCachedAboutArchiveBlock,
  getCachedAboutBlockDisplayOrder,
  getCachedAboutFaqBlock,
  getCachedAboutFoundationBlock,
  getCachedAboutMissionBlock,
  getCachedAboutPressBlock,
  getCachedAboutTeamBlock,
  getCachedArchiveYear,
} from "./cached-about-data";
import { buildFooterAboutLinks, buildNavbar } from "./build-navbar";
import type { FooterAboutLink } from "./build-navbar";
import type { AboutBlockDisplayOrderRow } from "./fetch-about-blocks";
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

const DEFAULT_BLOCK_ORDER = [
  ABOUT_BLOCK_IDS.TEAM,
  ABOUT_BLOCK_IDS.FOUNDATION,
  ABOUT_BLOCK_IDS.MISSION,
  ABOUT_BLOCK_IDS.PRESS,
  ABOUT_BLOCK_IDS.ARCHIVE,
  ABOUT_BLOCK_IDS.FAQ,
] as const;

const sortAboutPageBlocks = (
  blocksById: Map<string, AboutBlock>,
  displayOrder: AboutBlockDisplayOrderRow[],
  newsletterBlock: NewsletterBlock
): AboutBlock[] => {
  const orderedIds =
    displayOrder.length > 0
      ? displayOrder.map((row) => row.id)
      : [...DEFAULT_BLOCK_ORDER];

  const sortedBlocks: AboutBlock[] = [];
  const seen = new Set<string>();

  for (const id of orderedIds) {
    const block = blocksById.get(id);
    if (!block) {
      continue;
    }

    sortedBlocks.push(block);
    seen.add(id);
  }

  for (const [id, block] of blocksById) {
    if (!seen.has(id)) {
      sortedBlocks.push(block);
    }
  }

  const foundationIndex = sortedBlocks.findIndex(
    (block) => block.id === ABOUT_BLOCK_IDS.FOUNDATION
  );

  if (foundationIndex >= 0) {
    sortedBlocks.splice(foundationIndex + 1, 0, newsletterBlock);
    return sortedBlocks;
  }

  const teamIndex = sortedBlocks.findIndex(
    (block) => block.id === ABOUT_BLOCK_IDS.TEAM
  );
  const insertAt = teamIndex >= 0 ? teamIndex + 1 : 0;
  sortedBlocks.splice(insertAt, 0, newsletterBlock);

  return sortedBlocks;
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
    displayOrder,
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
    loadAboutSection("block-display-order", getCachedAboutBlockDisplayOrder, []),
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

  const blocksById = new Map<string, AboutBlock>([
    [ABOUT_BLOCK_IDS.TEAM, teamBlock],
    [ABOUT_BLOCK_IDS.FOUNDATION, foundationBlock],
    [ABOUT_BLOCK_IDS.PRESS, pressBlock],
    [ABOUT_BLOCK_IDS.ARCHIVE, archive],
    [ABOUT_BLOCK_IDS.FAQ, faqBlock],
    [ABOUT_BLOCK_IDS.MISSION, missionBlock],
  ]);

  const blocks = sortAboutPageBlocks(
    blocksById,
    displayOrder,
    NEWSLETTER_BLOCK
  );

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
