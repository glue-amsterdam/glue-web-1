import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCitizensForYear } from "@/lib/home/fetch-citizens-for-year";
import { fetchStickyGroupForYear } from "@/lib/home/fetch-sticky-group-for-year";
import { fetchYearNumbersForYear } from "@/lib/year-numbers/fetch-year-numbers-for-year";
import type { ArchiveYearSection } from "@/schemas/aboutPageSchema";
import { ABOUT_PAGE_FIXTURE } from "./about-page-fixture";

type ArchiveYearRow = {
  year: number;
  media_type: string | null;
  video_src: string | null;
  video_poster: string | null;
  video_alt: string | null;
  image_src: string | null;
  image_alt: string | null;
  text_title: string | null;
  text_description: string | null;
};

const buildMediaFromRow = (
  yearRow: ArchiveYearRow
): ArchiveYearSection["media"] => {
  const media: ArchiveYearSection["media"] = {};

  if (yearRow.media_type === "video" && yearRow.video_src) {
    media.video = {
      src: yearRow.video_src,
      alt: yearRow.video_alt ?? `GLUE ${yearRow.year}`,
      poster: yearRow.video_poster ?? "",
    };
  } else if (yearRow.media_type === "image" && yearRow.image_src) {
    media.image = {
      src: yearRow.image_src,
      alt: yearRow.image_alt ?? `GLUE ${yearRow.year}`,
    };
  }

  return media;
};

const getFixtureSection = (year: number): ArchiveYearSection | null => {
  const archive = ABOUT_PAGE_FIXTURE.blocks.find((b) => b.id === "archive");
  if (!archive || archive.id !== "archive") {
    return null;
  }

  const section = archive.default_section;
  if (!section || section.year !== year) {
    return null;
  }

  return section;
};

const buildSectionFromRow = async (
  supabase: SupabaseClient,
  yearRow: ArchiveYearRow
): Promise<ArchiveYearSection> => {
  const [numbers, citizens, sticky] = await Promise.all([
    fetchYearNumbersForYear(supabase, yearRow.year),
    fetchCitizensForYear(supabase, yearRow.year),
    fetchStickyGroupForYear(supabase, yearRow.year),
  ]);

  return {
    year: yearRow.year,
    media: buildMediaFromRow(yearRow),
    numbers,
    text_block: {
      title: yearRow.text_title ?? "",
      description: yearRow.text_description ?? "",
    },
    citizens_of_honour: {
      data:
        citizens.citizens.length > 0
          ? citizens
          : undefined,
    },
    sticky_members: {
      data:
        sticky.participants.length > 0
          ? sticky
          : undefined,
    },
  };
};

export const assembleArchiveYear = async (
  supabase: SupabaseClient,
  year: number
): Promise<ArchiveYearSection | null> => {
  const { data: yearRow, error } = await supabase
    .from("about_archive_years")
    .select("*")
    .eq("year", year)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (yearRow) {
    return buildSectionFromRow(supabase, yearRow as ArchiveYearRow);
  }

  const fixtureSection = getFixtureSection(year);
  if (!fixtureSection) {
    return null;
  }

  const [numbers, citizens, sticky] = await Promise.all([
    fetchYearNumbersForYear(supabase, year),
    fetchCitizensForYear(supabase, year),
    fetchStickyGroupForYear(supabase, year),
  ]);

  return {
    ...fixtureSection,
    numbers: numbers.length > 0 ? numbers : fixtureSection.numbers,
    citizens_of_honour: {
      data:
        citizens.citizens.length > 0
          ? citizens
          : fixtureSection.citizens_of_honour.data,
    },
    sticky_members: {
      data:
        sticky.participants.length > 0
          ? sticky
          : fixtureSection.sticky_members.data,
    },
  };
};
