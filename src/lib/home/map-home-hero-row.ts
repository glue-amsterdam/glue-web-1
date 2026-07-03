import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import type { HomeHeroData } from "./types";

type HomeHeroDbRow = {
  id: string;
  description: string;
  video_url: string;
  poster_url: string;
};

export const mapHomeHeroFromRow = (row: HomeHeroDbRow): HomeHeroData => ({
  id: row.id,
  description: row.description,
  videoUrl: toMediaUrl(row.video_url) ?? "",
  posterUrl: toMediaUrl(row.poster_url) ?? "",
});

export const mapHomeHeroToRow = (hero: {
  id?: string;
  description: string;
  video_url: string;
  poster_url: string;
}) => ({
  ...(hero.id ? { id: hero.id } : {}),
  description: hero.description,
  video_url: toMediaKey(hero.video_url) ?? "",
  poster_url: toMediaKey(hero.poster_url) ?? "",
  updated_at: new Date().toISOString(),
});
