import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientCitizen } from "@/schemas/citizenSchema";
import { fetchCitizensYearMeta } from "@/lib/citizens/fetch-citizens-year-meta";
import type { HomeCitizensData } from "./types";

export const EMPTY_HOME_CITIZENS: HomeCitizensData = {
  title: "",
  description: "",
  year: "",
  citizens: [],
};

export const fetchLatestYearCitizens = async (
  supabase: SupabaseClient
): Promise<HomeCitizensData> => {
  const { data: latestYearRow, error: yearError } = await supabase
    .from("about_citizens")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearError || !latestYearRow?.year) {
    return EMPTY_HOME_CITIZENS;
  }

  const yearStr = latestYearRow.year;

  const { data, error } = await supabase
    .from("about_citizens")
    .select("id, name, image_url, description, year")
    .eq("year", yearStr);

  if (error || !data?.length) {
    return EMPTY_HOME_CITIZENS;
  }

  const meta = await fetchCitizensYearMeta(supabase, yearStr);

  const citizens: ClientCitizen[] = data.map((citizen) => ({
    id: citizen.id,
    name: citizen.name,
    description: citizen.description,
    year: citizen.year,
    image_url: citizen.image_url ?? "/placeholder.jpg",
  }));

  return {
    title: meta.title,
    description: meta.description,
    year: yearStr,
    citizens,
  };
};
