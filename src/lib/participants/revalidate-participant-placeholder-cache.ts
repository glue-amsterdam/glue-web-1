import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { revalidateProgramCacheIfLiveTour } from "@/lib/program/revalidate-program-cache";
import { revalidateExhibitorCachesIfLiveTour } from "@/lib/participants/revalidate-participant-visibility-caches";
import { PARTICIPANT_PLACEHOLDER_CACHE_TAG } from "@/lib/participants/get-participant-placeholder-url";

export const revalidateParticipantPlaceholderCache = async (
  supabase: SupabaseClient
): Promise<void> => {
  revalidateTag(PARTICIPANT_PLACEHOLDER_CACHE_TAG, "max");
  revalidatePath("/");
  await revalidateExhibitorCachesIfLiveTour(supabase);
  await revalidateMapDataCacheIfLiveTour(supabase);
  await revalidateProgramCacheIfLiveTour(supabase);
};
