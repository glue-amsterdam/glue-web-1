import { config } from "@/config";
import type { HomeVideoData } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

const HOME_VIDEO_PATH = "home-video/home-video.mp4";
const HOME_VIDEO_POSTER_PATH = "home-video/poster.jpg";

export const EMPTY_HOME_VIDEO: HomeVideoData = {
  videoUrl: "",
  posterUrl: "",
};

export const fetchHomeVideo = (supabase: SupabaseClient): HomeVideoData => {

  const {
    data: { publicUrl: videoUrl },
  } = supabase.storage.from(config.bucketName).getPublicUrl(HOME_VIDEO_PATH);

  const {
    data: { publicUrl: posterUrl },
  } = supabase.storage.from(config.bucketName).getPublicUrl(HOME_VIDEO_POSTER_PATH);

  return { videoUrl, posterUrl };
};
