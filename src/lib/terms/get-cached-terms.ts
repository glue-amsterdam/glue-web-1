import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export const TERMS_CACHE_TAG = "terms-and-conditions";

export const getCachedTerms = unstable_cache(
  async (): Promise<string> => {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("terms_and_conditions")
      .select("content")
      .single();

    if (error?.code === "PGRST116" || error?.code === "42P01") return "";
    if (error) throw error;
    return data?.content ?? "";
  },
  [TERMS_CACHE_TAG],
  { tags: [TERMS_CACHE_TAG], revalidate: 3600 }
);
