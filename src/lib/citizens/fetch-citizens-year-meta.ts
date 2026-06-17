import type { SupabaseClient } from "@supabase/supabase-js";

export type CitizensYearMeta = {
  year: number;
  title: string;
  description: string;
};

export const EMPTY_CITIZENS_YEAR_META: CitizensYearMeta = {
  year: 0,
  title: "",
  description: "",
};

export const fetchCitizensYearMeta = async (
  supabase: SupabaseClient,
  year: number | string
): Promise<CitizensYearMeta> => {
  const yearInt = typeof year === "string" ? parseInt(year, 10) : year;

  const { data, error } = await supabase
    .from("citizens_year_meta")
    .select("year, title, description")
    .eq("year", yearInt)
    .maybeSingle();

  if (error || !data) {
    return {
      year: yearInt,
      title: "",
      description: "",
    };
  }

  return {
    year: data.year,
    title: data.title ?? "",
    description: data.description ?? "",
  };
};

export const upsertCitizensYearMeta = async (
  supabase: SupabaseClient,
  meta: CitizensYearMeta
) => {
  const { error } = await supabase.from("citizens_year_meta").upsert(
    {
      year: meta.year,
      title: meta.title,
      description: meta.description,
    },
    { onConflict: "year" }
  );

  if (error) throw error;
};
