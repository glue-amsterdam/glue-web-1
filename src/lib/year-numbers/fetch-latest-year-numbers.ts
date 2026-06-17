import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchYearNumbersForYear,
  type YearNumberItem,
} from "./fetch-year-numbers-for-year";

export type LatestYearNumbersData = {
  year: number;
  items: YearNumberItem[];
};

export const EMPTY_LATEST_YEAR_NUMBERS: LatestYearNumbersData = {
  year: 0,
  items: [],
};

export const fetchLatestYearNumbers = async (
  supabase: SupabaseClient
): Promise<LatestYearNumbersData> => {
  const { data: latestYearRow, error: yearError } = await supabase
    .from("year_numbers")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearError || latestYearRow?.year == null) {
    return EMPTY_LATEST_YEAR_NUMBERS;
  }

  const items = await fetchYearNumbersForYear(supabase, latestYearRow.year);

  if (!items.length) {
    return EMPTY_LATEST_YEAR_NUMBERS;
  }

  return {
    year: latestYearRow.year,
    items,
  };
};
