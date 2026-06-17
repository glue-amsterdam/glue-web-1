"use server";

import {
  createPressKitLink,
  deletePressKitLink,
  fetchMainColors,
  fetchMainLinksAdmin,
  fetchMainMenu,
  fetchPressKitLinksAdmin,
  updateMainColors,
  updateMainLinksAdmin,
  updateMainMenu,
  updatePressKitLinksAdmin,
} from "@/lib/main/fetch-main-admin";
import { revalidateMainLinksCache } from "@/lib/main/revalidate-main-links-cache";
import { revalidatePressKitLinksCache } from "@/lib/main/revalidate-press-kit-links-cache";
import { revalidateSiteThemeCache } from "@/lib/main/revalidate-site-theme-cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import type {
  MainColorsFormData,
  MainLinksAdmin,
  MainMenuData,
} from "@/schemas/mainSchema";
import { pressKitLinksFormSchema } from "@/schemas/mainSchema";

export async function getMainColors() {
  await requireAdmin();
  return fetchMainColors();
}

export async function saveMainColors(data: MainColorsFormData) {
  await requireAdmin();
  const result = await updateMainColors(data);
  revalidateSiteThemeCache();
  return result;
}

export async function getMainMenu() {
  await requireAdmin();
  return fetchMainMenu();
}

export async function saveMainMenu(data: MainMenuData) {
  await requireAdmin();
  const result = await updateMainMenu(data);
  revalidateSiteThemeCache();
  return result;
}

export async function getMainLinksAdmin() {
  await requireAdmin();
  return fetchMainLinksAdmin();
}

export async function saveMainLinks(data: MainLinksAdmin) {
  await requireAdmin();
  const result = await updateMainLinksAdmin(data);
  revalidateMainLinksCache();
  return result;
}

export async function getPressKitLinksAdmin() {
  await requireAdmin();
  return fetchPressKitLinksAdmin();
}

export async function savePressKitLinks(
  data: { pressKitLinks: { id: number; link: string; description?: string | null }[] }
) {
  await requireAdmin();
  pressKitLinksFormSchema.parse(data);
  const result = await updatePressKitLinksAdmin(data);
  revalidatePressKitLinksCache();
  return result;
}

export async function addPressKitLink(input?: {
  link?: string;
  description?: string | null;
}) {
  await requireAdmin();
  const result = await createPressKitLink(input ?? {});
  revalidatePressKitLinksCache();
  return result;
}

export async function removePressKitLink(id: string) {
  await requireAdmin();
  await deletePressKitLink(id);
  revalidatePressKitLinksCache();
}
