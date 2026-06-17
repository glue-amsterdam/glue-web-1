"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  fetchPlansApplicationStatus,
  fetchPlansBasePackage,
  updatePlansApplicationStatus,
  updatePlansBasePackage,
} from "@/lib/participate/fetch-plans-admin";
import { revalidateParticipatePlansCache } from "@/lib/participate/revalidate-participate-plans-cache";
import type {
  ParticipateApplicationStatusAdminData,
  ParticipateBasePackageAdminData,
} from "@/lib/participate/types";

export async function getPlansApplicationStatus() {
  await requireAdmin();
  return fetchPlansApplicationStatus();
}

export async function savePlansApplicationStatus(
  data: ParticipateApplicationStatusAdminData
) {
  const supabase = await requireAdmin();
  const result = await updatePlansApplicationStatus(data, supabase);
  revalidateParticipatePlansCache();
  return result;
}

export async function savePlansBasePackage(
  data: ParticipateBasePackageAdminData
) {
  const supabase = await requireAdmin();
  const result = await updatePlansBasePackage(data, supabase);
  revalidateParticipatePlansCache();
  return result;
}
