"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  fetchEventDays,
  fetchEventHeaderTitle,
  syncEventDays,
  upsertEventHeaderTitle,
} from "@/lib/events/fetch-events-admin";
import { revalidateMainSectionCache } from "@/lib/main/revalidate-main-section-cache";
import type { EventDay } from "@/schemas/eventSchemas";

export async function getEventHeaderTitle() {
  await requireAdmin();
  return fetchEventHeaderTitle();
}

export async function saveEventHeaderTitle(headerTitle: string) {
  await requireAdmin();
  return upsertEventHeaderTitle(headerTitle);
}

export async function getEventDays() {
  await requireAdmin();
  return fetchEventDays();
}

export async function saveEventDays(eventDays: EventDay[]) {
  await requireAdmin();
  const result = await syncEventDays(eventDays);
  revalidateMainSectionCache();
  return result;
}
