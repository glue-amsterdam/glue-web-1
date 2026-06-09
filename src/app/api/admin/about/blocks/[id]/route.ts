import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateAboutBlockCache } from "@/lib/about/revalidate-about-cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const blockUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  is_visible: z.boolean(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_block_1: z.string().optional(),
  text_block_2: z.string().optional(),
});

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await props.params;

  try {
    const { data: block, error } = await auth.supabase
      .from("about_blocks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    const { data: media } = await auth.supabase
      .from("about_block_media")
      .select("*")
      .eq("block_id", id)
      .maybeSingle();

    const { data: text } = await auth.supabase
      .from("about_block_text")
      .select("*")
      .eq("block_id", id)
      .maybeSingle();

    const { data: members } = await auth.supabase
      .from("about_team_members")
      .select("*")
      .eq("block_id", id)
      .order("display_order");

    let faqItems: { question: string; answer: string; display_order: number }[] =
      [];
    if (id === ABOUT_BLOCK_IDS.FAQ) {
      const { data: items } = await auth.supabase
        .from("about_faq_items")
        .select("question, answer, display_order")
        .eq("block_id", id)
        .order("display_order");
      faqItems = items ?? [];
    }

    return NextResponse.json({
      block,
      media,
      text,
      members: members ?? [],
      items: faqItems,
    });
  } catch (error) {
    console.error(`Error in GET /api/admin/about/blocks/${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await props.params;

  try {
    const body = await request.json();
    const validated = blockUpdateSchema.parse(body);

    const { error: blockError } = await auth.supabase
      .from("about_blocks")
      .update({
        title: validated.title,
        description: validated.description,
        is_visible: validated.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (blockError) {
      throw blockError;
    }

    if (validated.image_src) {
      await auth.supabase.from("about_block_media").upsert({
        block_id: id,
        image_src: validated.image_src,
        image_alt: validated.image_alt ?? validated.title,
      });
    }

    if (
      id === ABOUT_BLOCK_IDS.FOUNDATION ||
      id === ABOUT_BLOCK_IDS.MISSION ||
      id === ABOUT_BLOCK_IDS.PRESS
    ) {
      await auth.supabase.from("about_block_text").upsert({
        block_id: id,
        text_block_1: validated.text_block_1 ?? "",
        text_block_2: validated.text_block_2 ?? "",
      });
    }

    revalidateAboutBlockCache(id);

    return NextResponse.json({ message: "Block updated successfully" });
  } catch (error) {
    console.error(`Error in PUT /api/admin/about/blocks/${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}
