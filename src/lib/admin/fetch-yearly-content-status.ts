import type { SupabaseClient } from "@supabase/supabase-js";
import type { YearlyContentYearStatus } from "./yearly-content-types";

export const fetchYearlyContentStatus = async (
  supabase: SupabaseClient,
  year: number
): Promise<YearlyContentYearStatus> => {
  const { count: citizensCount, error: citizensError } = await supabase
    .from("about_citizens")
    .select("*", { count: "exact", head: true })
    .eq("year", String(year));

  if (citizensError) {
    throw citizensError;
  }

  const { data: stickyGroup, error: stickyError } = await supabase
    .from("sticky_groups")
    .select("id, group_photo_url")
    .eq("year", year)
    .maybeSingle();

  if (stickyError) {
    throw stickyError;
  }

  let stickyCount = 0;
  if (stickyGroup?.id) {
    const { count, error: participantsError } = await supabase
      .from("sticky_group_participants")
      .select("*", { count: "exact", head: true })
      .eq("sticky_group_id", stickyGroup.id);

    if (participantsError) {
      throw participantsError;
    }
    stickyCount = count ?? 0;
  }

  const { data: yearNumbers, error: yearNumbersError } = await supabase
    .from("year_numbers")
    .select("id")
    .eq("year", year)
    .maybeSingle();

  if (yearNumbersError) {
    throw yearNumbersError;
  }

  const { data: archiveRow, error: archiveError } = await supabase
    .from("about_archive_years")
    .select("media_type, video_src, image_src")
    .eq("year", year)
    .maybeSingle();

  if (archiveError) {
    throw archiveError;
  }

  const hasMedia = Boolean(
    archiveRow?.media_type === "video"
      ? archiveRow.video_src
      : archiveRow?.media_type === "image"
        ? archiveRow.image_src
        : false
  );

  return {
    year,
    citizens: {
      available: (citizensCount ?? 0) > 0,
      count: citizensCount ?? 0,
    },
    sticky: {
      available: stickyCount > 0 || Boolean(stickyGroup),
      count: stickyCount,
      has_photo: Boolean(stickyGroup?.group_photo_url),
    },
    year_numbers: {
      configured: Boolean(yearNumbers),
    },
    archive: {
      configured: Boolean(archiveRow),
      has_media: hasMedia,
    },
  };
};

export const fetchAllYearlyContentYears = async (
  supabase: SupabaseClient
): Promise<number[]> => {
  const [
    { data: yearNumbersRows, error: yearNumbersError },
    { data: stickyRows, error: stickyError },
    { data: citizensRows, error: citizensError },
    { data: archiveRows, error: archiveError },
  ] = await Promise.all([
    supabase.from("year_numbers").select("year"),
    supabase.from("sticky_groups").select("year"),
    supabase.from("about_citizens").select("year"),
    supabase.from("about_archive_years").select("year"),
  ]);

  if (yearNumbersError) throw yearNumbersError;
  if (stickyError) throw stickyError;
  if (citizensError) throw citizensError;
  if (archiveError) throw archiveError;

  const yearSet = new Set<number>();

  for (const row of yearNumbersRows ?? []) {
    yearSet.add(row.year);
  }
  for (const row of stickyRows ?? []) {
    yearSet.add(row.year);
  }
  for (const row of citizensRows ?? []) {
    yearSet.add(Number(row.year));
  }
  for (const row of archiveRows ?? []) {
    yearSet.add(row.year);
  }

  return [...yearSet].sort((a, b) => b - a);
};
