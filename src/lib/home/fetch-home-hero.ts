import { config } from "@/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getDefaultHeroDescription,
  getLegacyHeroMediaUrls,
} from "./legacy-hero-media";
import { mapHomeHeroFromRow } from "./map-home-hero-row";
import type { HomeHeroData } from "./types";

export const EMPTY_HOME_HERO: HomeHeroData = {
  id: null,
  description: "",
  videoUrl: "",
  posterUrl: "",
};

export const fetchHomeHero = async (
  supabase: SupabaseClient
): Promise<HomeHeroData> => {
  const { data, error } = await supabase
    .from("home_hero")
    .select("id, description, video_url, poster_url")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data && !error) {
    return mapHomeHeroFromRow(data);
  }

  const legacy = getLegacyHeroMediaUrls(supabase);

  return {
    id: null,
    description: getDefaultHeroDescription(config.cityName),
    videoUrl: legacy.videoUrl,
    posterUrl: legacy.posterUrl,
  };
};
