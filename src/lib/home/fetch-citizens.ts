import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientCitizen } from "@/schemas/citizenSchema";
import type { HomeCitizensData } from "./types";

export const EMPTY_HOME_CITIZENS: HomeCitizensData = {
  title: "",
  description: "",
  is_visible: false,
  year: "",
  citizens: [],
};

export const fetchLatestYearCitizens = async (
  supabase: SupabaseClient
): Promise<HomeCitizensData> => {
  const { data: section, error: headerError } = await supabase
    .from("about_citizens_section")
    .select("title, description, is_visible")
    .single();

  if (headerError || !section) {
    return EMPTY_HOME_CITIZENS;
  }

  if (!section.is_visible) {
    return {
      ...EMPTY_HOME_CITIZENS,
      is_visible: false,
    };
  }

  const { data: latestYearRow, error: yearError } = await supabase
    .from("about_citizens")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearError || !latestYearRow?.year) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: "",
      citizens: [],
    };
  }

  const { data, error } = await supabase
    .from("about_citizens")
    .select("id, name, image_url, description, year")
    .eq("year", latestYearRow.year);

  if (error || !data?.length) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: latestYearRow.year,
      citizens: [],
    };
  }

  const citizens: ClientCitizen[] = data.map((citizen) => ({
    id: citizen.id,
    name: citizen.name,
    description: citizen.description,
    year: citizen.year,
    image_url: citizen.image_url ?? "/placeholder.jpg",
  }));

  return {
    title: section.title ?? "",
    description: section.description ?? "",
    is_visible: section.is_visible,
    year: latestYearRow.year,
    citizens,
  };
};
