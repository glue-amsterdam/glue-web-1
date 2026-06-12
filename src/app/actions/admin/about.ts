"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createAboutSponsor,
  deleteAboutSponsor,
  fetchAboutCarouselAdmin,
  fetchAboutCitizensHeader,
  fetchAboutCuratedSection,
  fetchAboutParticipantsSection,
  fetchAboutSponsors,
  fetchAboutSponsorsHeader,
  updateAboutCitizensSection,
  updateAboutSponsor,
  updateAboutSponsorsHeader,
  upsertAboutCuratedSection,
  upsertAboutParticipantsSection,
} from "@/lib/about/fetch-about-admin";
import {
  blockUpdateSchema,
  fetchAboutBlockAdmin,
  updateAboutBlock,
} from "@/lib/about/fetch-about-block-admin";
import type { Sponsor, SponsorsHeader } from "@/schemas/sponsorsSchema";
import type { CitizensSectionHeader } from "@/schemas/citizenSchema";

export async function getAboutParticipantsSection() {
  await requireAdmin();
  return fetchAboutParticipantsSection();
}

export async function saveAboutParticipantsSection(data: {
  title: string;
  description: string;
  is_visible: boolean;
}) {
  await requireAdmin();
  return upsertAboutParticipantsSection(data);
}

export async function getAboutCuratedSection() {
  await requireAdmin();
  return fetchAboutCuratedSection();
}

export async function saveAboutCuratedSection(data: {
  title: string;
  description: string;
  is_visible: boolean;
}) {
  await requireAdmin();
  return upsertAboutCuratedSection(data);
}

export async function getAboutCitizensHeader() {
  await requireAdmin();
  return fetchAboutCitizensHeader();
}

export async function saveAboutCitizensSection(data: CitizensSectionHeader) {
  await requireAdmin();
  return updateAboutCitizensSection(data);
}

export async function getAboutCarouselAdmin() {
  await requireAdmin();
  return fetchAboutCarouselAdmin();
}

export async function getAboutSponsors() {
  await requireAdmin();
  return fetchAboutSponsors();
}

export async function getAboutSponsorsHeader() {
  await requireAdmin();
  return fetchAboutSponsorsHeader();
}

export async function saveAboutSponsorsHeader(data: SponsorsHeader) {
  await requireAdmin();
  return updateAboutSponsorsHeader(data);
}

export async function addAboutSponsor(
  data: Omit<Sponsor, "id"> & { id?: string }
) {
  await requireAdmin();
  return createAboutSponsor(data);
}

export async function saveAboutSponsor(data: Sponsor) {
  await requireAdmin();
  return updateAboutSponsor(data);
}

export async function removeAboutSponsor(id: string) {
  await requireAdmin();
  await deleteAboutSponsor(id);
}

export async function getAboutBlockAdmin(blockId: string) {
  const supabase = await requireAdmin();
  return fetchAboutBlockAdmin(supabase, blockId);
}

export async function saveAboutBlock(
  blockId: string,
  data: {
    title: string;
    description: string;
    is_visible: boolean;
    image_src?: string;
    image_alt?: string;
    text_block_1?: string;
    text_block_2?: string;
  }
) {
  const supabase = await requireAdmin();
  blockUpdateSchema.parse(data);
  await updateAboutBlock(supabase, blockId, data);
}
