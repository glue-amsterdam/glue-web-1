import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";

export const HOME_EXHIBITORS_HEADER_CACHE_TAG = "home-exhibitors-header";

export const DEFAULT_HOME_EXHIBITORS_HEADER: ParticipantsSectionHeader = {
  title: "Exhibitors 2026",
  description:
    "Discover a selection of exhibitors from the GLUE design route.",
  is_visible: true,
};

export const fetchHomeExhibitorsHeader = async (
  supabase: SupabaseClient
): Promise<ParticipantsSectionHeader> => {
  const { data, error } = await supabase
    .from("about_participants")
    .select("title, description, is_visible")
    .single();

  if (error || !data) {
    return DEFAULT_HOME_EXHIBITORS_HEADER;
  }

  return {
    title: data.title || DEFAULT_HOME_EXHIBITORS_HEADER.title,
    description: data.description || DEFAULT_HOME_EXHIBITORS_HEADER.description,
    is_visible: data.is_visible ?? DEFAULT_HOME_EXHIBITORS_HEADER.is_visible,
  };
};
