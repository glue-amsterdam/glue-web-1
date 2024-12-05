import { nanoid } from "nanoid";
import { createClient } from "@/utils/supabase/server";

export async function generateUniqueSlug(baseSlug: string): Promise<string> {
  const supabase = await createClient();
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
