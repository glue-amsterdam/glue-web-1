import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import {
  EXHIBITOR_DETAIL_CACHE_TAG,
  EXHIBITOR_HUB_DETAIL_CACHE_TAG,
  EXHIBITORS_PAGE_CACHE_TAG,
} from "@/lib/participants/exhibitors-cache-tags";
import { HOME_EXHIBITORS_RANDOM_CACHE_TAG } from "@/lib/participants/fetch-random-home-exhibitors";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";

const CATALOG_REVALIDATION_FIELDS = [
  "is_active",
  "status",
  "category",
  "display_number",
  "display_name",
  "slug",
] as const satisfies readonly (keyof ParticipantDetails)[];

export const hasParticipantVisibilityChanged = (
  existing: ParticipantDetails | null,
  next: ParticipantDetails
): boolean => {
  if (!existing) return true;

  return CATALOG_REVALIDATION_FIELDS.some(
    (field) => existing[field] !== next[field]
  );
};

export const revalidateExhibitorSlugPaths = (
  previousSlug: string | null | undefined,
  nextSlug: string | null | undefined
): void => {
  if (previousSlug && previousSlug !== nextSlug) {
    revalidatePath(`/exhibitors/${previousSlug}`);
  }

  if (nextSlug && previousSlug !== nextSlug) {
    revalidatePath(`/exhibitors/${nextSlug}`);
  }
};

export const revalidateExhibitorCaches = (): void => {
  revalidateTag(EXHIBITORS_PAGE_CACHE_TAG, "max");
  revalidateTag(EXHIBITOR_DETAIL_CACHE_TAG, "max");
  revalidateTag(EXHIBITOR_HUB_DETAIL_CACHE_TAG, "max");
  revalidateTag(HOME_EXHIBITORS_RANDOM_CACHE_TAG, "max");
  revalidatePath("/exhibitors");
  revalidatePath("/");
};

/** Invalidate exhibitor caches only while the tour is live (snapshot data is frozen). */
export const revalidateExhibitorCachesIfLiveTour = async (
  supabase: SupabaseClient
): Promise<void> => {
  const { data, error } = await supabase
    .from("tour_status")
    .select("current_tour_status")
    .single();

  if (error) {
    console.error(
      "Could not read tour status for exhibitor cache invalidation:",
      error
    );
    return;
  }

  if (data?.current_tour_status === "new") {
    revalidateExhibitorCaches();
  }
};

export const revalidateParticipantVisibilityCaches = async (
  supabase: SupabaseClient
): Promise<void> => {
  await revalidateExhibitorCachesIfLiveTour(supabase);
  await revalidateMapDataCacheIfLiveTour(supabase);
};
