import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ABOUT_BLOCK_IDS,
  type ArchiveBlock,
  type FaqBlock,
  type TeamBlock,
  type TextDualBlock,
} from "@/schemas/aboutPageSchema";
import { ABOUT_PAGE_FIXTURE } from "./about-page-fixture";

const EMPTY_MEDIA = { image: { src: "/placeholder.jpg", alt: "" } };

const getFixtureTeam = (): TeamBlock => {
  const block = ABOUT_PAGE_FIXTURE.blocks.find(
    (b) => b.id === ABOUT_BLOCK_IDS.TEAM
  );
  return block as TeamBlock;
};

const getFixtureTextDual = (id: string): TextDualBlock => {
  const block = ABOUT_PAGE_FIXTURE.blocks.find((b) => b.id === id);
  return block as TextDualBlock;
};

const getFixtureArchive = (): ArchiveBlock => {
  const block = ABOUT_PAGE_FIXTURE.blocks.find(
    (b) => b.id === ABOUT_BLOCK_IDS.ARCHIVE
  ) as ArchiveBlock;
  return {
    ...block,
    years: block.years ?? [],
  };
};

const getFixtureFaq = (): FaqBlock => {
  const block = ABOUT_PAGE_FIXTURE.blocks.find(
    (b) => b.id === ABOUT_BLOCK_IDS.FAQ
  );
  return block as FaqBlock;
};

export const fetchAboutTeamBlock = async (
  supabase: SupabaseClient
): Promise<TeamBlock> => {
  const { data: block, error } = await supabase
    .from("about_blocks")
    .select("*")
    .eq("id", ABOUT_BLOCK_IDS.TEAM)
    .maybeSingle();

  if (error || !block) {
    return getFixtureTeam();
  }

  const { data: media } = await supabase
    .from("about_block_media")
    .select("image_src, image_alt")
    .eq("block_id", ABOUT_BLOCK_IDS.TEAM)
    .maybeSingle();

  const { data: members } = await supabase
    .from("about_team_members")
    .select("name, role, email, phone, description")
    .eq("block_id", ABOUT_BLOCK_IDS.TEAM)
    .order("display_order");

  return {
    id: ABOUT_BLOCK_IDS.TEAM,
    title: block.title,
    description: block.description ?? "",
    is_visible: block.is_visible,
    media: media?.image_src
      ? {
          image: {
            src: media.image_src,
            alt: media.image_alt ?? block.title,
          },
        }
      : EMPTY_MEDIA,
    members: (members ?? []).map((m) => ({
      name: m.name,
      role: m.role,
      email: m.email ?? "",
      phone: m.phone ?? undefined,
      description: m.description ?? undefined,
    })),
  };
};

export const fetchAboutTextDualBlock = async (
  supabase: SupabaseClient,
  blockId:
    | typeof ABOUT_BLOCK_IDS.FOUNDATION
    | typeof ABOUT_BLOCK_IDS.MISSION
    | typeof ABOUT_BLOCK_IDS.PRESS
): Promise<TextDualBlock> => {
  const { data: block, error } = await supabase
    .from("about_blocks")
    .select("*")
    .eq("id", blockId)
    .maybeSingle();

  if (error || !block) {
    return getFixtureTextDual(blockId);
  }

  const { data: media } = await supabase
    .from("about_block_media")
    .select("image_src, image_alt")
    .eq("block_id", blockId)
    .maybeSingle();

  const { data: text } = await supabase
    .from("about_block_text")
    .select("text_block_1, text_block_2")
    .eq("block_id", blockId)
    .maybeSingle();

  return {
    id: blockId,
    title: block.title,
    description: block.description ?? "",
    is_visible: block.is_visible,
    media: media?.image_src
      ? {
          image: {
            src: media.image_src,
            alt: media.image_alt ?? block.title,
          },
        }
      : EMPTY_MEDIA,
    text_block_1: text?.text_block_1 ?? "",
    text_block_2: text?.text_block_2 ?? "",
  };
};

export const fetchAboutArchiveBlock = async (
  supabase: SupabaseClient
): Promise<ArchiveBlock> => {
  const { data: block, error } = await supabase
    .from("about_blocks")
    .select("*")
    .eq("id", ABOUT_BLOCK_IDS.ARCHIVE)
    .maybeSingle();

  if (error || !block) {
    return getFixtureArchive();
  }

  const { data: years } = await supabase
    .from("about_archive_years")
    .select("year")
    .order("display_order", { ascending: false });

  const yearList = (years ?? []).map((row) => row.year);

  if (yearList.length === 0) {
    const fixture = getFixtureArchive();
    return {
      ...fixture,
      is_visible: block.is_visible,
      title: block.title,
      description: block.description ?? fixture.description,
      years: fixture.years ?? [],
      default_year: fixture.default_year,
      default_section: fixture.default_section,
    };
  }

  return {
    id: ABOUT_BLOCK_IDS.ARCHIVE,
    title: block.title,
    description: block.description ?? "",
    is_visible: block.is_visible,
    years: yearList,
    default_year: yearList[0],
  };
};

export const fetchAboutFaqBlock = async (
  supabase: SupabaseClient
): Promise<FaqBlock> => {
  const { data: block, error } = await supabase
    .from("about_blocks")
    .select("*")
    .eq("id", ABOUT_BLOCK_IDS.FAQ)
    .maybeSingle();

  if (error || !block) {
    return getFixtureFaq();
  }

  const { data: items } = await supabase
    .from("about_faq_items")
    .select("question, answer")
    .eq("block_id", ABOUT_BLOCK_IDS.FAQ)
    .order("display_order");

  const fixture = getFixtureFaq();

  return {
    id: ABOUT_BLOCK_IDS.FAQ,
    title: block.title,
    description: block.description ?? "",
    is_visible: block.is_visible,
    items:
      items && items.length > 0
        ? items.map((item) => ({
            question: item.question,
            answer: item.answer ?? "",
          }))
        : fixture.items,
  };
};
