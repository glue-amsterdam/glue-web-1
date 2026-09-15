import { nanoid } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const { data, error } = await supabase
      .from("participant_details")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${nanoid(4)}`;
      attempts++;
    }
  }

  if (!isUnique) {
    throw new Error("Unable to generate a unique slug");
  }

  return slug;
}
