import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExhibitorHubDetail,
  ExhibitorParticipantDetail,
} from "@/lib/participants/exhibitor-detail-types";
import type { ExhibitorsGroupedResponse } from "@/lib/participants/exhibitor-types";
import type { ParticipantCategory } from "@/lib/participants/participant-categories";
import type { ProgramDetail, ProgramListItem } from "@/lib/program/program-types";
import {
  programDetailToListItem,
  snapshotItemToCategory,
  type TourExhibitorDetailsSnapshot,
  type TourExhibitorsGroupedSnapshot,
  type TourHubDetailsSnapshot,
  type TourParticipantCategoriesSnapshot,
  type TourProgramSnapshot,
} from "./tour-snapshot-types";

export type TourSnapshotRow = {
  current_tour_status: "new" | "older" | string | null;
  previous_tour_program: unknown;
  previous_tour_exhibitors_grouped: unknown;
  previous_tour_exhibitor_details: unknown;
  previous_tour_hub_details: unknown;
  previous_tour_participant_categories: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const normalizeProgramSnapshot = (
  raw: unknown
): TourProgramSnapshot | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== 1 || !Array.isArray(raw.details)) return null;
  return {
    version: 1,
    capturedAt:
      typeof raw.capturedAt === "string"
        ? raw.capturedAt
        : new Date(0).toISOString(),
    details: raw.details as ProgramDetail[],
  };
};

export const normalizeExhibitorsGroupedSnapshot = (
  raw: unknown
): TourExhibitorsGroupedSnapshot | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== 1 || !isRecord(raw.grouped)) return null;
  return {
    version: 1,
    capturedAt:
      typeof raw.capturedAt === "string"
        ? raw.capturedAt
        : new Date(0).toISOString(),
    grouped: raw.grouped as ExhibitorsGroupedResponse,
  };
};

export const normalizeExhibitorDetailsSnapshot = (
  raw: unknown
): TourExhibitorDetailsSnapshot | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== 1 || !isRecord(raw.bySlug)) return null;
  return {
    version: 1,
    capturedAt:
      typeof raw.capturedAt === "string"
        ? raw.capturedAt
        : new Date(0).toISOString(),
    bySlug: raw.bySlug as Record<string, ExhibitorParticipantDetail>,
  };
};

export const normalizeHubDetailsSnapshot = (
  raw: unknown
): TourHubDetailsSnapshot | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== 1 || !isRecord(raw.byHubId)) return null;
  return {
    version: 1,
    capturedAt:
      typeof raw.capturedAt === "string"
        ? raw.capturedAt
        : new Date(0).toISOString(),
    byHubId: raw.byHubId as Record<string, ExhibitorHubDetail>,
  };
};

export const normalizeParticipantCategoriesSnapshot = (
  raw: unknown
): TourParticipantCategoriesSnapshot | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== 1 || !Array.isArray(raw.categories)) return null;
  return {
    version: 1,
    capturedAt:
      typeof raw.capturedAt === "string"
        ? raw.capturedAt
        : new Date(0).toISOString(),
    categories: raw.categories as TourParticipantCategoriesSnapshot["categories"],
  };
};

export const fetchTourSnapshotRow = async (
  supabase: SupabaseClient
): Promise<TourSnapshotRow | null> => {
  const { data, error } = await supabase
    .from("tour_status")
    .select(
      `
      current_tour_status,
      previous_tour_program,
      previous_tour_exhibitors_grouped,
      previous_tour_exhibitor_details,
      previous_tour_hub_details,
      previous_tour_participant_categories
    `
    )
    .single();

  if (error) {
    console.error("fetchTourSnapshotRow:", error);
    return null;
  }

  return data as TourSnapshotRow;
};

export const getProgramListFromSnapshot = (
  raw: unknown
): ProgramListItem[] | null => {
  const snapshot = normalizeProgramSnapshot(raw);
  if (!snapshot) return null;
  return snapshot.details.map(programDetailToListItem);
};

export const getProgramDetailFromSnapshot = (
  raw: unknown,
  eventId: string
): ProgramDetail | null => {
  const snapshot = normalizeProgramSnapshot(raw);
  if (!snapshot) return null;
  return (
    snapshot.details.find((detail) => detail.eventId === eventId) ?? null
  );
};

export const getExhibitorsGroupedFromSnapshot = (
  raw: unknown
): ExhibitorsGroupedResponse | null => {
  const snapshot = normalizeExhibitorsGroupedSnapshot(raw);
  return snapshot?.grouped ?? null;
};

export const getExhibitorDetailFromSnapshot = (
  raw: unknown,
  slug: string
): ExhibitorParticipantDetail | null => {
  const snapshot = normalizeExhibitorDetailsSnapshot(raw);
  if (!snapshot) return null;
  return snapshot.bySlug[slug] ?? null;
};

export const getHubDetailFromSnapshot = (
  raw: unknown,
  hubId: string
): ExhibitorHubDetail | null => {
  const snapshot = normalizeHubDetailsSnapshot(raw);
  if (!snapshot) return null;
  return snapshot.byHubId[hubId] ?? null;
};

export const getParticipantCategoriesFromSnapshot = (
  raw: unknown
): ParticipantCategory[] | null => {
  const snapshot = normalizeParticipantCategoriesSnapshot(raw);
  if (!snapshot || snapshot.categories.length === 0) return null;
  return snapshot.categories.map(snapshotItemToCategory);
};
