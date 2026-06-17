import {
  ABOUT_ANCHORS,
  ABOUT_BLOCK_IDS,
  type AboutBlock,
  type AboutNavLink,
  type ArchiveBlock,
  type FaqBlock,
  type TextDualBlock,
  type TeamBlock,
} from "@/schemas/aboutPageSchema";

const BLOCK_NAV_CONFIG: {
  blockId: string;
  label: (block: AboutBlock) => string;
  href: string;
  isVisible: (blocks: AboutBlock[]) => boolean;
}[] = [
  {
    blockId: ABOUT_BLOCK_IDS.TEAM,
    label: (b) => (b as TeamBlock).title,
    href: `#${ABOUT_ANCHORS.TEAM}`,
    isVisible: (blocks) =>
      blocks.find((b) => b.id === ABOUT_BLOCK_IDS.TEAM)?.is_visible ?? false,
  },
  {
    blockId: ABOUT_BLOCK_IDS.FOUNDATION,
    label: (b) => (b as TextDualBlock).title,
    href: `#${ABOUT_ANCHORS.FOUNDATION}`,
    isVisible: (blocks) =>
      blocks.find((b) => b.id === ABOUT_BLOCK_IDS.FOUNDATION)?.is_visible ??
      false,
  },
  {
    blockId: ABOUT_BLOCK_IDS.PRESS,
    label: (b) => (b as TextDualBlock).title,
    href: `#${ABOUT_ANCHORS.PRESS}`,
    isVisible: (blocks) =>
      blocks.find((b) => b.id === ABOUT_BLOCK_IDS.PRESS)?.is_visible ?? false,
  },
  {
    blockId: ABOUT_BLOCK_IDS.ARCHIVE,
    label: (b) => (b as ArchiveBlock).title,
    href: `#${ABOUT_ANCHORS.ARCHIVE}`,
    isVisible: (blocks) =>
      blocks.find((b) => b.id === ABOUT_BLOCK_IDS.ARCHIVE)?.is_visible ?? false,
  },
  {
    blockId: ABOUT_BLOCK_IDS.FAQ,
    label: (b) => (b as FaqBlock).title,
    href: `#${ABOUT_ANCHORS.FAQ}`,
    isVisible: (blocks) =>
      blocks.find((b) => b.id === ABOUT_BLOCK_IDS.FAQ)?.is_visible ?? false,
  },
  {
    blockId: ABOUT_BLOCK_IDS.MISSION,
    label: (b) => (b as TextDualBlock).title,
    href: `#${ABOUT_ANCHORS.MISSION}`,
    isVisible: (blocks) =>
      blocks.find((b) => b.id === ABOUT_BLOCK_IDS.MISSION)?.is_visible ?? false,
  },
];

export const buildNavbar = (blocks: AboutBlock[]): AboutNavLink[] => {
  return BLOCK_NAV_CONFIG.map((config) => {
    const block = blocks.find((b) => b.id === config.blockId);
    const visible = config.isVisible(blocks);

    return {
      label: block ? config.label(block) : config.label(blocks[0]!),
      href: config.href,
      is_visible: visible,
    };
  }).filter((link) => link.is_visible);
};

const FOOTER_ABOUT_BLOCK_IDS = [
  ABOUT_BLOCK_IDS.FAQ,
  ABOUT_BLOCK_IDS.PRESS,
  ABOUT_BLOCK_IDS.ARCHIVE,
] as const;

export type FooterAboutLink = {
  title: string;
  link: string;
};

export const buildFooterAboutLinks = (
  blocks: AboutBlock[]
): FooterAboutLink[] => {
  const configByBlockId = new Map(
    BLOCK_NAV_CONFIG.map((config) => [config.blockId, config])
  );

  return FOOTER_ABOUT_BLOCK_IDS.flatMap((blockId) => {
    const config = configByBlockId.get(blockId);
    if (!config || !config.isVisible(blocks)) {
      return [];
    }

    const block = blocks.find((b) => b.id === blockId);

    return [
      {
        title: block ? config.label(block) : blockId,
        link: `/about${config.href}`,
      },
    ];
  });
};
