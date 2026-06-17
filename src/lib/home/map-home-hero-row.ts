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
  videoUrl: row.video_url,
  posterUrl: row.poster_url,
});

export const mapHomeHeroToRow = (hero: {
  id?: string;
  description: string;
  video_url: string;
  poster_url: string;
}) => ({
  ...(hero.id ? { id: hero.id } : {}),
  description: hero.description,
  video_url: hero.video_url,
  poster_url: hero.poster_url,
  updated_at: new Date().toISOString(),
});
