import type { SupabaseClient } from "@supabase/supabase-js";

const slugify = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const generateUniquePostSlug = async (
  supabase: SupabaseClient,
  title: string,
  excludePostId?: string
): Promise<string> => {
  const base = slugify(title) || "untitled";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const { data, error } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || (excludePostId && data.id === excludePostId)) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};
