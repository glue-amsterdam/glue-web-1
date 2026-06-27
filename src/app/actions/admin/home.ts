"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { fetchHomeHero } from "@/lib/home/fetch-home-hero";
import { mapHomeHeroToRow } from "@/lib/home/map-home-hero-row";
import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import { revalidateHomeVideoCache } from "@/lib/home/revalidate-home-cache";
import {
  createHomeText,
  deleteHomeText,
  fetchHomeTexts,
  updateHomeTexts,
} from "@/lib/main/fetch-home-text-admin";
import { revalidateSiteThemeCache } from "@/lib/main/revalidate-site-theme-cache";
import { homeHeroSchema } from "@/schemas/homeHeroSchema";
import type { HomeTextsFormData } from "@/schemas/mainSchema";
import type { HomeTextPlacement } from "@/schemas/mainSchema";

export async function saveHomeHero(data: {
  id?: string;
  description: string;
  video_url: string;
  poster_url: string;
}) {
  const supabase = await requireAdmin();
  const validated = homeHeroSchema.parse(data);
  const row = mapHomeHeroToRow(validated);

  let savedRow;

  if (validated.id) {
    const { data: updated, error } = await supabase
      .from("home_hero")
      .update(row)
      .eq("id", validated.id)
      .select("id, description, video_url, poster_url")
      .single();

    if (error) {
      throw error;
    }
    savedRow = updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("home_hero")
      .insert({
        description: validated.description,
        video_url: toMediaKey(validated.video_url) ?? "",
        poster_url: toMediaKey(validated.poster_url) ?? "",
      })
      .select("id, description, video_url, poster_url")
      .single();

    if (error) {
      throw error;
    }
    savedRow = inserted;
  }

  revalidateHomeVideoCache();

  return homeHeroSchema.parse({
    id: savedRow.id,
    description: savedRow.description,
    video_url: toMediaUrl(savedRow.video_url),
    poster_url: toMediaUrl(savedRow.poster_url),
  });
}

export async function saveHomeTexts(data: HomeTextsFormData) {
  await requireAdmin();
  const result = await updateHomeTexts(data);
  revalidateSiteThemeCache();
  return result;
}

export async function addHomeText(input: {
  label: string;
  color: string;
  href: string;
  placement: HomeTextPlacement;
}) {
  await requireAdmin();
  const result = await createHomeText(input);
  revalidateSiteThemeCache();
  return result;
}

export async function removeHomeText(id: string) {
  await requireAdmin();
  await deleteHomeText(id);
  revalidateSiteThemeCache();
}

export async function getHomeTextsAdmin() {
  await requireAdmin();
  return fetchHomeTexts();
}

export async function getHomeHeroAdmin() {
  const supabase = await requireAdmin();
  const hero = await fetchHomeHero(supabase);
  return {
    id: hero.id ?? undefined,
    description: hero.description,
    video_url: hero.videoUrl,
    poster_url: hero.posterUrl,
  };
}
