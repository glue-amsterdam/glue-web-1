"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  fetchTerms,
  revalidateTermsCache,
  termsSchema,
  upsertTerms,
} from "@/lib/terms/fetch-terms-admin";

export async function getTerms() {
  await requireAdmin();
  return fetchTerms();
}

export async function saveTerms(data: { content: string }) {
  await requireAdmin();
  termsSchema.parse(data);
  const result = await upsertTerms(data);
  revalidateTermsCache();
  return result;
}
