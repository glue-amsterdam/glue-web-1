import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export const TERMS_CACHE_TAG = "terms-and-conditions";

export const DEFAULT_TERMS_TITLE = "Terms & Conditions";
export const DEFAULT_TERMS_SUBTITLE =
  "By submitting an entry for GLUE, the participant entering accepts these rules, terms and conditions.";

const CACHE_REVALIDATE = false as const;

export type TermsBlock = {
  title: string;
  subtitle: string;
  content: string;
};

const DEFAULT_TERMS_BLOCK: TermsBlock = {
  title: DEFAULT_TERMS_TITLE,
  subtitle: DEFAULT_TERMS_SUBTITLE,
  content: "",
};

export const getCachedTerms = unstable_cache(
  async (): Promise<TermsBlock> => {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("terms_and_conditions")
      .select("title, subtitle, content")
      .single();

    if (error?.code === "PGRST116" || error?.code === "42P01") {
      return DEFAULT_TERMS_BLOCK;
    }
    if (error) throw error;

    return {
      title: data?.title ?? DEFAULT_TERMS_TITLE,
      subtitle: data?.subtitle ?? DEFAULT_TERMS_SUBTITLE,
      content: data?.content ?? "",
    };
  },
  [TERMS_CACHE_TAG],
  { tags: [TERMS_CACHE_TAG], revalidate: CACHE_REVALIDATE }
);
