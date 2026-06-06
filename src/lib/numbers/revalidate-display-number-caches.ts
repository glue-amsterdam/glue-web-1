import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXHIBITORS_PAGE_CACHE_TAG } from "@/lib/participants/fetch-exhibitors";
import { PROGRAM_PAGE_CACHE_TAG } from "@/lib/program/fetch-program-page";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";

export const revalidateDisplayNumberCaches = async (
  supabase: SupabaseClient
): Promise<void> => {
  await revalidateMapDataCacheIfLiveTour(supabase);
  revalidateTag(EXHIBITORS_PAGE_CACHE_TAG, "max");
  revalidatePath("/exhibitors");
  revalidateTag(PROGRAM_PAGE_CACHE_TAG, "max");
  revalidatePath("/program");
};
