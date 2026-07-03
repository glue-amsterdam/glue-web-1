"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  fetchStaticPage,
  revalidateStaticPageCache,
  staticPageSchema,
  upsertStaticPage,
} from "@/lib/static-pages/fetch-static-page-admin";
import type { StaticPageSlug } from "@/lib/static-pages/static-pages-config";

export async function getStaticPage(slug: StaticPageSlug) {
  const supabase = await requireAdmin();
  return fetchStaticPage(slug, supabase);
}

export async function saveStaticPage(
  slug: StaticPageSlug,
  data: {
    title: string;
    subtitle?: string;
    content: string;
  }
) {
  const supabase = await requireAdmin();
  staticPageSchema.parse(data);
  const result = await upsertStaticPage(slug, data, supabase);
  revalidateStaticPageCache(slug);
  return result;
}
