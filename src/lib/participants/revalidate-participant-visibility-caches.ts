import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { EXHIBITORS_PAGE_CACHE_TAG } from "@/lib/participants/fetch-exhibitors";
import { HOME_EXHIBITORS_RANDOM_CACHE_TAG } from "@/lib/participants/fetch-random-home-exhibitors";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";

const CATALOG_REVALIDATION_FIELDS = [
  "is_active",
  "status",
  "special_program",
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

export const revalidateParticipantVisibilityCaches = async (
  supabase: SupabaseClient
): Promise<void> => {
  revalidateTag(EXHIBITORS_PAGE_CACHE_TAG, "max");
  revalidateTag(HOME_EXHIBITORS_RANDOM_CACHE_TAG, "max");
  revalidatePath("/exhibitors");
  revalidatePath("/");
  await revalidateMapDataCacheIfLiveTour(supabase);
};
