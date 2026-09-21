import type { SupabaseClient } from "@supabase/supabase-js";
import { flattenExhibitors } from "@/lib/participants/flatten-exhibitors";
import { getExhibitorBySlug } from "@/lib/participants/get-exhibitor-by-slug";
import { getExhibitorHubById } from "@/lib/participants/get-exhibitor-hub-by-id";
import { getExhibitors } from "@/lib/participants/get-exhibitors";
import {
  ExhibitorNotFoundError,
  type ExhibitorHubDetail,
  type ExhibitorParticipantDetail,
} from "@/lib/participants/exhibitor-detail-types";
import { fetchParticipantCategories } from "@/lib/participants/participant-categories";
import { getProgramDetail } from "@/lib/program/get-program-detail";
import { ProgramNotFoundError } from "@/lib/program/program-types";
import {
  categoryToSnapshotItem,
  type BuiltTourContentSnapshots,
  type TourExhibitorDetailsSnapshot,
  type TourExhibitorsGroupedSnapshot,
  type TourHubDetailsSnapshot,
  type TourParticipantCategoriesSnapshot,
  type TourProgramSnapshot,
} from "./tour-snapshot-types";

const DETAIL_CONCURRENCY = 8;

export type ProgramSnapshotSource = "current" | "last_year";

const mapPool = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> => {
  if (items.length === 0) return [];

  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const current = nextIndex;
        nextIndex += 1;
        results[current] = await mapper(items[current]);
      }
    }
  );

  await Promise.all(workers);
  return results;
};

const createParticipantCategoriesSnapshot = async (
  supabase: SupabaseClient
): Promise<TourParticipantCategoriesSnapshot> => {
  const categories = await fetchParticipantCategories(supabase);
  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    categories: categories.map(categoryToSnapshotItem),
  };
};

/**
 * Build program freeze from live events.
 * - current: is_last_year_event = false (normal Close)
 * - last_year: is_last_year_event = true (repair / Close recovery when already flagged)
 */
export const buildProgramSnapshot = async (
  supabase: SupabaseClient,
  source: ProgramSnapshotSource
): Promise<TourProgramSnapshot> => {
  const { data: events, error } = await supabase
    .from("events")
    .select("id")
    .eq("event_day_out", false)
    .eq("is_last_year_event", source === "last_year");

  if (error) {
    throw new Error(`Failed to list events for program snapshot: ${error.message}`);
  }

  const eventIds = (events ?? []).map((event) => event.id as string);

  if (eventIds.length === 0) {
    return {
      version: 1,
      capturedAt: new Date().toISOString(),
      details: [],
    };
  }

  const details = (
    await mapPool(eventIds, DETAIL_CONCURRENCY, async (eventId) => {
      try {
        return await getProgramDetail(supabase, eventId, {
          bypassSnapshot: true,
          eventSource: source,
        });
      } catch (error) {
        if (error instanceof ProgramNotFoundError) return null;
        throw error;
      }
    })
  ).filter((detail): detail is NonNullable<typeof detail> => detail !== null);

  if (details.length === 0) {
    throw new Error(
      `Program snapshot detail build failed: listed ${eventIds.length} events but resolved 0 details (source=${source}).`
    );
  }

  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    details,
  };
};

const createExhibitorsGroupedSnapshot = async (
  supabase: SupabaseClient
): Promise<TourExhibitorsGroupedSnapshot> => {
  const grouped = await getExhibitors(supabase);
  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    grouped,
  };
};

const createExhibitorDetailsSnapshot = async (
  supabase: SupabaseClient,
  grouped: TourExhibitorsGroupedSnapshot["grouped"]
): Promise<TourExhibitorDetailsSnapshot> => {
  const slugs = [
    ...new Set(
      flattenExhibitors(grouped)
        .map((item) => item.slug?.trim())
        .filter((slug): slug is string => Boolean(slug))
    ),
  ];

  const bySlug: Record<string, ExhibitorParticipantDetail> = {};

  await mapPool(slugs, DETAIL_CONCURRENCY, async (slug) => {
    try {
      bySlug[slug] = await getExhibitorBySlug(supabase, slug);
    } catch (error) {
      if (error instanceof ExhibitorNotFoundError) return;
      throw error;
    }
  });

  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    bySlug,
  };
};

const createHubDetailsSnapshot = async (
  supabase: SupabaseClient,
  grouped: TourExhibitorsGroupedSnapshot["grouped"]
): Promise<TourHubDetailsSnapshot> => {
  const hubIds = [
    ...new Set(
      flattenExhibitors(grouped)
        .map((item) => item.hubId?.trim())
        .filter((hubId): hubId is string => Boolean(hubId))
    ),
  ];

  const byHubId: Record<string, ExhibitorHubDetail> = {};

  await mapPool(hubIds, DETAIL_CONCURRENCY, async (hubId) => {
    try {
      byHubId[hubId] = await getExhibitorHubById(supabase, hubId);
    } catch (error) {
      if (error instanceof ExhibitorNotFoundError) return;
      throw error;
    }
  });

  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    byHubId,
  };
};

/**
 * Build frozen public DTOs from the live (current) tour.
 * Call this BEFORE flipping tour status / last-year flags.
 *
 * Program snapshot prefers current events; if none remain, falls back to
 * last-year events (covers already-flagged recovery). Fails if both empty.
 */
export const buildTourContentSnapshots = async (
  supabase: SupabaseClient
): Promise<BuiltTourContentSnapshots> => {
  let program = await buildProgramSnapshot(supabase, "current");
  if (program.details.length === 0) {
    program = await buildProgramSnapshot(supabase, "last_year");
  }
  if (program.details.length === 0) {
    throw new Error(
      "No events available to snapshot for program (current and last-year are empty)."
    );
  }

  const [exhibitorsGrouped, participantCategories] = await Promise.all([
    createExhibitorsGroupedSnapshot(supabase),
    createParticipantCategoriesSnapshot(supabase),
  ]);

  const [exhibitorDetails, hubDetails] = await Promise.all([
    createExhibitorDetailsSnapshot(supabase, exhibitorsGrouped.grouped),
    createHubDetailsSnapshot(supabase, exhibitorsGrouped.grouped),
  ]);

  return {
    program,
    exhibitorsGrouped,
    exhibitorDetails,
    hubDetails,
    participantCategories,
  };
};
