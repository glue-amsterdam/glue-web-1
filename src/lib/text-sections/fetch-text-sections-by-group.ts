import type { SupabaseClient } from "@supabase/supabase-js";
import {
  TEXT_SECTION_SLUGS,
  type TextSectionAdminGroup,
  type TextSectionSlug,
} from "@/schemas/textSectionSchema";
import { getTextSectionDefault } from "./text-section-defaults";
import { mapTextSectionFromRow } from "./map-text-section-row";
import type { TextSectionData } from "./types";

const slugsForGroup = (group: TextSectionAdminGroup): TextSectionSlug[] =>
  TEXT_SECTION_SLUGS.filter((slug) => getTextSectionDefault(slug).adminGroup === group);

export const fetchTextSectionsByGroup = async (
  supabase: SupabaseClient,
  group: TextSectionAdminGroup
): Promise<TextSectionData[]> => {
  const expectedSlugs = slugsForGroup(group);

  const { data, error } = await supabase
    .from("text_sections")
    .select(
      "slug, admin_group, variant, title, description, show_button, button_label, button_link, section_id"
    )
    .eq("admin_group", group);

  if (error || !data?.length) {
    return expectedSlugs.map((slug) => getTextSectionDefault(slug));
  }

  const bySlug = new Map(
    data.map((row) => [row.slug, mapTextSectionFromRow(row)])
  );

  return expectedSlugs.map(
    (slug) => bySlug.get(slug) ?? getTextSectionDefault(slug)
  );
};
