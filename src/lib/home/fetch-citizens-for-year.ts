import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientCitizen } from "@/schemas/citizenSchema";
import { fetchCitizensYearMeta } from "@/lib/citizens/fetch-citizens-year-meta";
import { toMediaUrl } from "@/lib/media/media-url";
import { EMPTY_HOME_CITIZENS } from "./fetch-citizens";
import type { HomeCitizensData } from "./types";

export const fetchCitizensForYear = async (
  supabase: SupabaseClient,
  year: string | number
): Promise<HomeCitizensData> => {
  const yearStr = String(year);

  const { data, error } = await supabase
    .from("about_citizens")
    .select("id, name, image_url, description, year")
    .eq("year", yearStr);

  if (error || !data?.length) {
    return {
      ...EMPTY_HOME_CITIZENS,
      year: yearStr,
    };
  }

  const meta = await fetchCitizensYearMeta(supabase, yearStr);

  const citizens: ClientCitizen[] = data.map((citizen) => ({
    id: citizen.id,
    name: citizen.name,
    description: citizen.description,
    year: citizen.year,
    image_url: toMediaUrl(citizen.image_url) ?? "/placeholder.jpg",
  }));

  return {
    title: meta.title,
    description: meta.description,
    year: yearStr,
    citizens,
  };
};
