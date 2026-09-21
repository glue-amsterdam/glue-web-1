import { cache } from "react";
import { getCachedSiteTheme, type SiteTheme } from "@/lib/main/cached-site-theme";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  fetchTourSnapshotRow,
  getParticipantCategoriesFromSnapshot,
} from "@/lib/tour/read-tour-snapshots";

export type { SiteTheme } from "@/lib/main/cached-site-theme";

/**
 * Site theme with live main_colors / nav / home texts.
 * When the tour is older, participant category colors/labels come from the
 * frozen tour snapshot so public badges match that year's types.
 */
export const getTheme = cache(async (): Promise<SiteTheme> => {
  const theme = await getCachedSiteTheme();
  const supabase = createPublicSupabaseClient();
  const snapshotRow = await fetchTourSnapshotRow(supabase);

  if (snapshotRow?.current_tour_status !== "older") {
    return theme;
  }

  const snapshottedCategories = getParticipantCategoriesFromSnapshot(
    snapshotRow.previous_tour_participant_categories
  );

  if (!snapshottedCategories) {
    return theme;
  }

  return {
    ...theme,
    participantCategories: snapshottedCategories,
  };
});
