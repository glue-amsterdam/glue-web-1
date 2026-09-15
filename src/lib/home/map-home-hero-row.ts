import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import type { HomeHeroData } from "./types";

type HomeHeroDbRow = {
  id: string;
  description: string;
  video_url: string;
  video_url_mobile: string | null;
  poster_url: string;
};

export const mapHomeHeroFromRow = (row: HomeHeroDbRow): HomeHeroData => ({
  id: row.id,
  description: row.description,
  videoUrl: toMediaUrl(row.video_url) ?? "",
  videoUrlMobile: toMediaUrl(row.video_url_mobile) ?? "",
  posterUrl: toMediaUrl(row.poster_url) ?? "",
});

export const mapHomeHeroToRow = (hero: {
  id?: string;
  description: string;
  video_url: string;
  video_url_mobile?: string;
  poster_url: string;
}) => ({
  ...(hero.id ? { id: hero.id } : {}),
  description: hero.description,
  video_url: toMediaKey(hero.video_url) ?? "",
  video_url_mobile: hero.video_url_mobile
    ? (toMediaKey(hero.video_url_mobile) ?? null)
    : null,
  poster_url: toMediaKey(hero.poster_url) ?? "",
  updated_at: new Date().toISOString(),
});
