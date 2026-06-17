import { mapHomeTextFromRow } from "@/lib/main/map-home-text-row";
import {
  homeTextsFormSchema,
  homeTextsSaveSchema,
  type HomeTextPlacement,
  type HomeTextsFormData,
} from "@/schemas/mainSchema";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const FOOTER_PLACEMENTS: HomeTextPlacement[] = ["footer_left", "footer_right"];

const validateFooterSlotUniqueness = (
  homeTexts: Array<{ placement: HomeTextPlacement; id?: string }>
) => {
  for (const placement of FOOTER_PLACEMENTS) {
    const matches = homeTexts.filter((item) => item.placement === placement);
    if (matches.length > 1) {
      return `Only one row is allowed for placement "${placement}"`;
    }
  }
  return null;
};

const countRowsByPlacement = async (
  supabase: SupabaseClient,
  placement: HomeTextPlacement
) => {
  const { count, error } = await supabase
    .from("home_text")
    .select("id", { count: "exact", head: true })
    .eq("placement", placement);

  if (error) {
    throw error;
  }

  return count ?? 0;
};

export const fetchHomeTexts = async (supabase?: SupabaseClient) => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("home_text")
    .select("id, label, color, href, placement, sort_order")
    .order("sort_order");

  if (error) {
    throw new Error(error.message);
  }

  return homeTextsFormSchema.parse({
    homeTexts: (data ?? []).map(mapHomeTextFromRow),
  });
};

export const updateHomeTexts = async (
  input: HomeTextsFormData,
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validated = homeTextsSaveSchema.parse(input);
  const slotError = validateFooterSlotUniqueness(validated.homeTexts);

  if (slotError) {
    throw new Error(slotError);
  }

  const updatePromises = validated.homeTexts.map(async (item, index) => {
    const { error } = await client
      .from("home_text")
      .update({
        label: item.label,
        color: item.color,
        href: item.href,
        sort_order: index,
      })
      .eq("id", item.id);

    if (error) {
      throw error;
    }
  });

  await Promise.all(updatePromises);

  return fetchHomeTexts(client);
};

export const createHomeText = async (
  input: {
    label: string;
    color: string;
    href: string;
    placement: HomeTextPlacement;
  },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());

  if (FOOTER_PLACEMENTS.includes(input.placement)) {
    const count = await countRowsByPlacement(client, input.placement);
    if (count >= 1) {
      throw new Error(
        `Only one row is allowed for placement "${input.placement}"`
      );
    }
  }

  const { data, error } = await client
    .from("home_text")
    .insert({
      label: input.label,
      color: input.color,
      href: input.href,
      placement: input.placement,
      sort_order: 0,
    })
    .select("id, label, color, href, placement, sort_order")
    .single();

  if (error) {
    throw error;
  }

  return mapHomeTextFromRow(data);
};

export const deleteHomeText = async (
  id: string,
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());

  const { data: row, error: fetchError } = await client
    .from("home_text")
    .select("placement")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  if (row.placement !== "marquee") {
    throw new Error("Only marquee rows can be deleted");
  }

  const { error } = await client.from("home_text").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
