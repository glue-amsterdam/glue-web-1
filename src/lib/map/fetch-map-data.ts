import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { buildMapLocations } from "./build-map-locations";
import { fetchMapRoutes } from "./fetch-map-routes";
import {
  enrichLegacyLocationsWithHubIds,
  isLegacyMapInfoArray,
  normalizeSnapshotLocations,
} from "./normalize-legacy-snapshot";
import type { MapPageData, TourStatusRow } from "./types";
import { MAP_DATA_CACHE_TAG } from "./types";

export const getTourStatusRow = async (
  supabase: SupabaseClient
): Promise<TourStatusRow> => {
  const { data, error } = await supabase
    .from("tour_status")
    .select("current_tour_status, updated_at, previous_tour_map_info")
    .single();

  if (error) {
    console.error("Error fetching tour status row:", error);
    return {
      current_tour_status: "new",
      updated_at: new Date(0).toISOString(),
      previous_tour_map_info: null,
    };
  }

  return {
    current_tour_status:
      data.current_tour_status === "older" ? "older" : "new",
    updated_at: data.updated_at,
    previous_tour_map_info: data.previous_tour_map_info,
  };
};

const fetchMapPageDataWithClient = async (
  supabase: SupabaseClient,
  tourStatus: TourStatusRow["current_tour_status"],
  previousTourMapInfo: unknown
): Promise<MapPageData> => {
  const routes = await fetchMapRoutes(supabase);

  if (tourStatus === "older") {
    const snapshotLocations = normalizeSnapshotLocations(previousTourMapInfo);

    if (snapshotLocations && snapshotLocations.length > 0) {
      const locations = isLegacyMapInfoArray(previousTourMapInfo)
        ? await enrichLegacyLocationsWithHubIds(
            supabase,
            previousTourMapInfo,
            snapshotLocations
          )
        : snapshotLocations;

      return {
        tourMode: "snapshot",
        locations,
        routes,
      };
    }

    console.warn(
      "Tour is older but map snapshot is missing; falling back to live build with was_active_last_year filter."
    );

    const locations = await buildMapLocations(supabase, "older");
    return {
      tourMode: "snapshot",
      locations,
      routes,
    };
  }

  const locations = await buildMapLocations(supabase, "new");
  return {
    tourMode: "live",
    locations,
    routes,
  };
};

/**
 * Cached map payload. Uses a cookie-less Supabase client and receives tour
 * context from the page (which reads tour_status outside the cache scope).
 */
export const getCachedMapPageData = unstable_cache(
  async (
    _cacheKey: string,
    tourStatus: TourStatusRow["current_tour_status"],
    previousTourMapInfo: unknown
  ): Promise<MapPageData> => {
    const supabase = createPublicSupabaseClient();
    return fetchMapPageDataWithClient(
      supabase,
      tourStatus,
      previousTourMapInfo
    );
  },
  ["map-page-data"],
  { tags: [MAP_DATA_CACHE_TAG], revalidate: 3600 }
);

export const fetchMapPageDataForSnapshot = async (
  supabase: SupabaseClient
): Promise<MapPageData> => {
  const locations = await buildMapLocations(supabase, "new");
  const routes = await fetchMapRoutes(supabase);
  return { tourMode: "live", locations, routes };
};

export const loadMapPageData = async (supabase: SupabaseClient) => {
  const tourRow = await getTourStatusRow(supabase);
  const initialData = await getCachedMapPageData(
    tourRow.updated_at,
    tourRow.current_tour_status,
    tourRow.previous_tour_map_info
  );
  return { tourRow, initialData };
};
