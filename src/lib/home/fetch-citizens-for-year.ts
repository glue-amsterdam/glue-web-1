import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientCitizen } from "@/schemas/citizenSchema";
import { EMPTY_HOME_CITIZENS } from "./fetch-citizens";
import type { HomeCitizensData } from "./types";

export const fetchCitizensForYear = async (
  supabase: SupabaseClient,
  year: string | number
): Promise<HomeCitizensData> => {
  const yearStr = String(year);

  const { data: section, error: headerError } = await supabase
    .from("about_citizens_section")
    .select("title, description, is_visible")
    .single();

  if (headerError || !section) {
    return EMPTY_HOME_CITIZENS;
  }

  const { data, error } = await supabase
    .from("about_citizens")
    .select("id, name, image_url, description, year")
    .eq("year", yearStr);

  if (error || !data?.length) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: yearStr,
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
    year: yearStr,
    citizens,
  };
};
