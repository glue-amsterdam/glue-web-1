import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MAP_DATA_CACHE_TAG } from "./types";

export const revalidateMapDataCache = (): void => {
  revalidateTag(MAP_DATA_CACHE_TAG, "max");
  revalidatePath("/map");
};

/** Invalidate map cache only while the tour is live (snapshot data is frozen). */
export const revalidateMapDataCacheIfLiveTour = async (
  supabase: SupabaseClient
): Promise<void> => {
  const { data, error } = await supabase
    .from("tour_status")
    .select("current_tour_status")
    .single();

  if (error) {
    console.error("Could not read tour status for map cache invalidation:", error);
    return;
  }

  if (data?.current_tour_status === "new") {
    revalidateMapDataCache();
  }
};
