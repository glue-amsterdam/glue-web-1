import type { SupabaseClient } from "@supabase/supabase-js";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";
import { getTextSectionDefault } from "./text-section-defaults";
import { mapTextSectionFromRow } from "./map-text-section-row";
import type { TextSectionData } from "./types";

export const fetchTextSection = async (
  supabase: SupabaseClient,
  slug: TextSectionSlug
): Promise<TextSectionData> => {
  const { data, error } = await supabase
    .from("text_sections")
    .select(
      "slug, admin_group, variant, title, description, show_button, button_label, button_link, section_id"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return getTextSectionDefault(slug);
  }

  return mapTextSectionFromRow(data);
};
