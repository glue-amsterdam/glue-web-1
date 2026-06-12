"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { fetchTextSection } from "@/lib/text-sections/fetch-text-section";
import { mapTextSectionToRow } from "@/lib/text-sections/map-text-section-row";
import { revalidateTextSectionCache } from "@/lib/text-sections/revalidate-text-section-cache";
import { getTextSectionDefault } from "@/lib/text-sections/text-section-defaults";
import {
  isTextSectionSlug,
  textSectionUpdateSchema,
  type TextSectionSlug,
} from "@/schemas/textSectionSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export async function saveTextSection(
  slug: TextSectionSlug,
  data: {
    title: string;
    description: string;
    show_button: boolean;
    button_label?: string | null;
    button_link?: string | null;
  }
) {
  const supabase = await requireAdmin();

  if (!isTextSectionSlug(slug)) {
    throw new Error("Invalid slug");
  }

  const validated = textSectionUpdateSchema.parse(data);
  const defaults = getTextSectionDefault(slug);
  const row = mapTextSectionToRow(slug, {
    title: validated.title,
    description: validated.description,
    show_button: validated.show_button,
    button_label: validated.button_label ?? null,
    button_link: validated.button_link ?? null,
  });

  const { error } = await supabase
    .from("text_sections")
    .upsert(
      {
        ...row,
        admin_group: defaults.adminGroup,
        variant: defaults.variant,
        section_id: defaults.sectionId,
      },
      { onConflict: "slug" }
    );

  if (error) {
    throw error;
  }

  revalidateTextSectionCache(slug);

  const publicSupabase = createPublicSupabaseClient();
  return fetchTextSection(publicSupabase, slug);
}
