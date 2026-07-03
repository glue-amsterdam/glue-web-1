import {
  STATIC_PAGE_CACHE_TAG,
  STATIC_PAGE_DEFAULTS,
  STATIC_PAGE_PATH,
  type StaticPageSlug,
} from "@/lib/static-pages/static-pages-config";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const staticPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

export type StaticPageData = z.infer<typeof staticPageSchema> & {
  id?: string;
  slug?: StaticPageSlug;
};

const getDefaultStaticPageData = (slug: StaticPageSlug): StaticPageData => {
  const defaults = STATIC_PAGE_DEFAULTS[slug];

  return {
    title: defaults.title,
    subtitle: defaults.subtitle ?? undefined,
    content: defaults.content,
  };
};

export const fetchStaticPage = async (
  slug: StaticPageSlug,
  supabase?: SupabaseClient
): Promise<StaticPageData> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("static_content_pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      return getDefaultStaticPageData(slug);
    }
    throw error;
  }

  const defaults = STATIC_PAGE_DEFAULTS[slug];

  return {
    title: data?.title ?? defaults.title,
    subtitle: data?.subtitle ?? defaults.subtitle ?? undefined,
    content: data?.content ?? defaults.content,
    id: data?.id,
    slug,
  };
};

export const upsertStaticPage = async (
  slug: StaticPageSlug,
  input: z.infer<typeof staticPageSchema>,
  supabase?: SupabaseClient
): Promise<StaticPageData> => {
  const client = supabase ?? (await createClient());
  const validatedData = staticPageSchema.parse(input);

  const { data: existingData } = await client
    .from("static_content_pages")
    .select("id")
    .eq("slug", slug)
    .single();

  const payload = {
    title: validatedData.title,
    subtitle: validatedData.subtitle?.trim() ? validatedData.subtitle : null,
    content: validatedData.content,
    updated_at: new Date().toISOString(),
  };

  if (existingData) {
    const { data, error } = await client
      .from("static_content_pages")
      .update(payload)
      .eq("id", existingData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { ...data, slug };
  }

  const { data, error } = await client
    .from("static_content_pages")
    .insert({
      slug,
      ...payload,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { ...data, slug };
};

export const revalidateStaticPageCache = (slug: StaticPageSlug) => {
  revalidateTag(STATIC_PAGE_CACHE_TAG(slug), "max");
  revalidatePath(STATIC_PAGE_PATH[slug]);
};
