import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import { revalidateAboutBlockCache } from "@/lib/about/revalidate-about-cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const blockUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  is_visible: z.boolean(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_block_1: z.string().optional(),
  text_block_2: z.string().optional(),
});

export type AboutBlockAdminData = {
  block: {
    id: string;
    title: string;
    description: string;
    is_visible: boolean;
    [key: string]: unknown;
  };
  media: {
    block_id: string;
    image_src: string;
    image_alt: string;
  } | null;
  text: {
    block_id: string;
    text_block_1: string;
    text_block_2: string;
  } | null;
  members: Array<{
    id: string;
    block_id: string;
    name: string;
    role: string;
    display_order: number;
    [key: string]: unknown;
  }>;
  items: Array<{
    question: string;
    answer: string;
    display_order: number;
  }>;
};

export const fetchAboutBlockAdmin = async (
  supabase: SupabaseClient,
  id: string
): Promise<AboutBlockAdminData | null> => {
  const { data: block, error } = await supabase
    .from("about_blocks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !block) {
    return null;
  }

  const { data: media } = await supabase
    .from("about_block_media")
    .select("*")
    .eq("block_id", id)
    .maybeSingle();

  const { data: text } = await supabase
    .from("about_block_text")
    .select("*")
    .eq("block_id", id)
    .maybeSingle();

  const { data: members } = await supabase
    .from("about_team_members")
    .select("*")
    .eq("block_id", id)
    .order("display_order");

  let faqItems: AboutBlockAdminData["items"] = [];
  if (id === ABOUT_BLOCK_IDS.FAQ) {
    const { data: items } = await supabase
      .from("about_faq_items")
      .select("question, answer, display_order")
      .eq("block_id", id)
      .order("display_order");
    faqItems = items ?? [];
  }

  return {
    block,
    media,
    text,
    members: members ?? [],
    items: faqItems,
  };
};

export const updateAboutBlock = async (
  supabase: SupabaseClient,
  id: string,
  input: z.infer<typeof blockUpdateSchema>
) => {
  const validated = blockUpdateSchema.parse(input);

  const { error: blockError } = await supabase
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
    await supabase.from("about_block_media").upsert({
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
    await supabase.from("about_block_text").upsert({
      block_id: id,
      text_block_1: validated.text_block_1 ?? "",
      text_block_2: validated.text_block_2 ?? "",
    });
  }

  revalidateAboutBlockCache(id);
};
