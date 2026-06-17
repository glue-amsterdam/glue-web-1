import type { SupabaseClient } from "@supabase/supabase-js";

export type YearNumberItem = {
  label: string;
  value: string;
};

export const fetchYearNumbersForYear = async (
  supabase: SupabaseClient,
  year: number
): Promise<YearNumberItem[]> => {
  const { data: yearRow, error: yearError } = await supabase
    .from("year_numbers")
    .select("id")
    .eq("year", year)
    .maybeSingle();

  if (yearError || !yearRow) {
    return [];
  }

  const { data: items, error: itemsError } = await supabase
    .from("year_number_items")
    .select("label, value")
    .eq("year_numbers_id", yearRow.id)
    .order("display_order");

  if (itemsError || !items?.length) {
    return [];
  }

  return items.map((item) => ({
    label: item.label,
    value: item.value,
  }));
};
