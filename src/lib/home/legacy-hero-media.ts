import { config } from "@/config";
import type { SupabaseClient } from "@supabase/supabase-js";

export const LEGACY_HOME_VIDEO_PATH = "home-video/home-video.mp4";
export const LEGACY_HOME_POSTER_PATH = "home-video/poster.jpg";

export const getDefaultHeroDescription = (cityName: string): string =>
  `The ${cityName} design route connecting the best design hotspots in town including over 140 designers, studios, showrooms, co-working labs, academies, galleries and more.`;

export const getLegacyHeroMediaUrls = (
  supabase: SupabaseClient
): { videoUrl: string; posterUrl: string } => {
  const {
    data: { publicUrl: videoUrl },
  } = supabase.storage.from(config.bucketName).getPublicUrl(LEGACY_HOME_VIDEO_PATH);

  const {
    data: { publicUrl: posterUrl },
  } = supabase.storage.from(config.bucketName).getPublicUrl(LEGACY_HOME_POSTER_PATH);

  return { videoUrl, posterUrl };
};
