import { TERMS_CACHE_TAG } from "@/lib/terms/get-cached-terms";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const termsSchema = z.object({
  content: z.string().min(1, "Terms and conditions content is required"),
});

export type TermsData = z.infer<typeof termsSchema> & { id?: string };

const DEFAULT_TERMS_CONTENT =
  "<p>Terms and conditions content will be displayed here.</p>";

export const fetchTerms = async (
  supabase?: SupabaseClient
): Promise<TermsData> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("terms_and_conditions")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      return { content: DEFAULT_TERMS_CONTENT };
    }
    throw error;
  }

  return data ?? { content: "" };
};

export const upsertTerms = async (
  input: z.infer<typeof termsSchema>,
  supabase?: SupabaseClient
): Promise<TermsData> => {
  const client = supabase ?? (await createClient());
  const validatedData = termsSchema.parse(input);

  const { data: existingData } = await client
    .from("terms_and_conditions")
    .select("id")
    .limit(1)
    .single();

  if (existingData) {
    const { data, error } = await client
      .from("terms_and_conditions")
      .update({
        content: validatedData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await client
    .from("terms_and_conditions")
    .insert({
      content: validatedData.content,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const revalidateTermsCache = () => {
  revalidateTag(TERMS_CACHE_TAG, "max");
  revalidatePath("/terms-and-conditions");
  revalidatePath("/sign-up");
  revalidatePath("/participate/apply");
};
