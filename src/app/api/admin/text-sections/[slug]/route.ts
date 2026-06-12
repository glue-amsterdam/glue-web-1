import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { fetchTextSection } from "@/lib/text-sections/fetch-text-section";
import { mapTextSectionToRow } from "@/lib/text-sections/map-text-section-row";
import { revalidateTextSectionCache } from "@/lib/text-sections/revalidate-text-section-cache";
import { getTextSectionDefault } from "@/lib/text-sections/text-section-defaults";
import {
  isTextSectionSlug,
  textSectionUpdateSchema,
} from "@/schemas/textSectionSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { slug } = await context.params;

    if (!isTextSectionSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const body = await request.json();
    const validated = textSectionUpdateSchema.parse(body);
    const defaults = getTextSectionDefault(slug);
    const row = mapTextSectionToRow(slug, {
      title: validated.title,
      description: validated.description,
      show_button: validated.show_button,
      button_label: validated.button_label ?? null,
      button_link: validated.button_link ?? null,
    });

    const { data, error } = await auth.supabase
      .from("text_sections")
      .upsert(
        {
          ...row,
          admin_group: defaults.adminGroup,
          variant: defaults.variant,
          section_id: defaults.sectionId,
        },
        { onConflict: "slug" }
      )
      .select(
        "slug, admin_group, variant, title, description, show_button, button_label, button_link, section_id"
      )
      .single();

    if (error) {
      throw error;
    }

    revalidateTextSectionCache(slug);

    const supabase = createPublicSupabaseClient();
    const section = await fetchTextSection(supabase, slug);

    return NextResponse.json(section ?? data);
  } catch (error) {
    console.error("Error in PUT /api/admin/text-sections/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to update text section" },
      { status: 500 }
    );
  }
}
