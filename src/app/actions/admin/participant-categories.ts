"use server";

import {
  createParticipantCategory,
  deleteParticipantCategory,
  fetchParticipantCategoriesAdmin,
  updateParticipantCategory,
} from "@/lib/participants/fetch-participant-categories-admin";
import { revalidateSiteThemeCache } from "@/lib/main/revalidate-site-theme-cache";
import { revalidateParticipantVisibilityCaches } from "@/lib/participants/revalidate-participant-visibility-caches";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { ParticipantCategoryUserFormData } from "@/schemas/participantCategorySchema";

export async function getParticipantCategoriesAdmin() {
  await requireAdmin();
  return fetchParticipantCategoriesAdmin();
}

export async function saveParticipantCategory(data: ParticipantCategoryUserFormData) {
  const supabase = await requireAdmin();
  const result = data.id
    ? await updateParticipantCategory(data, supabase)
    : await createParticipantCategory(data, supabase);
  revalidateSiteThemeCache();
  return result;
}

export async function removeParticipantCategory(id: string) {
  const supabase = await requireAdmin();
  const result = await deleteParticipantCategory(id, supabase);
  revalidateSiteThemeCache();
  await revalidateParticipantVisibilityCaches(supabase);
  return result;
}
