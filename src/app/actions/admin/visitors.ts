"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createVisitorArea,
  deleteVisitorArea,
  fetchVisitorAreas,
  updateVisitorArea,
} from "@/lib/visitors/fetch-visitor-areas";

export async function getVisitorAreas() {
  const supabase = await requireAdmin();
  return fetchVisitorAreas(supabase);
}

export async function addVisitorArea(name: string) {
  const supabase = await requireAdmin();
  return createVisitorArea(name, supabase);
}

export async function saveVisitorArea(id: string, name: string) {
  const supabase = await requireAdmin();
  return updateVisitorArea(id, name, supabase);
}

export async function removeVisitorArea(id: string) {
  const supabase = await requireAdmin();
  await deleteVisitorArea(id, supabase);
}
