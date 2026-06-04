import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { MapLocation, MapRoute } from "@/lib/map/types";

/** Lower = behind; higher = on top (Mapbox circle/symbol sort-key). */
export const MARKER_STACK_ORDER: Record<ExhibitorType, number> = {
  hub: 0,
  "up-to-three-participants": 1,
  "special-program": 2,
};

const MARKER_STACK_ORDER_ROUTE = 0;

export const getMarkerSortKey = (
  type: ExhibitorType | "route",
  index: number
): number => {
  const stack =
    type === "route" ? MARKER_STACK_ORDER_ROUTE : MARKER_STACK_ORDER[type];
  return stack * 1000 + index;
};

export type MapViewMode = "none" | "exhibitors" | "routes";

export type MapFilters = {
  view: MapViewMode;
  type: ExhibitorsFilterType;
  q: string;
};

export const DEFAULT_MAP_FILTERS: MapFilters = {
  view: "none",
  type: "all",
  q: "",
};

const locationMatchesSearchQuery = (
  location: MapLocation,
  query: string
): boolean => {
  if (location.name.toLowerCase().includes(query)) return true;
  if (location.displayNumber?.toLowerCase().includes(query)) return true;
  return (
    location.members?.some((member) =>
      member.name.toLowerCase().includes(query)
    ) ?? false
  );
};

/** Search matches all exhibitors; category (`type`) does not narrow results. */
export const filterMapLocationsForSearch = (
  locations: MapLocation[],
  q: string
): MapLocation[] => {
  const query = q.trim().toLowerCase();
  if (!query) return locations;

  return locations.filter((location) =>
    locationMatchesSearchQuery(location, query)
  );
};

export const filterMapLocations = (
  locations: MapLocation[],
  filters: Pick<MapFilters, "type" | "q">
): MapLocation[] => {
  let result = locations;

  if (filters.type !== "all") {
    result = result.filter((location) => location.type === filters.type);
  }

  const query = filters.q.trim().toLowerCase();
  if (query) {
    result = result.filter((location) =>
      locationMatchesSearchQuery(location, query)
    );
  }

  return result;
};

/** Exhibitors panel: global search when `q` is set; category filter only when not searching. */
export const filterMapLocationsForList = (
  locations: MapLocation[],
  filters: MapFilters
): MapLocation[] => {
  const query = filters.q.trim();
  if (query) {
    return filterMapLocationsForSearch(locations, query);
  }

  return filterMapLocations(locations, { type: filters.type, q: "" });
};

/** Map markers ignore category (`type`); only search (`q`) narrows visible dots. */
export const filterMapLocationsForMap = (
  locations: MapLocation[],
  filters: Pick<MapFilters, "type" | "q">
): MapLocation[] =>
  filterMapLocations(locations, { type: "all", q: filters.q });

export const filterMapRoutes = (routes: MapRoute[], q: string): MapRoute[] => {
  const query = q.trim().toLowerCase();
  if (!query) return routes;

  return routes.filter(
    (route) =>
      route.name.toLowerCase().includes(query) ||
      route.zone.toLowerCase().includes(query) ||
      (route.description?.toLowerCase().includes(query) ?? false) ||
      route.dots.some((dot) => dot.name.toLowerCase().includes(query))
  );
};

/** Ascending stack order: hubs first in source, special-program last (drawn on top). */
export const sortMapLocationsForMarkers = (
  locations: MapLocation[]
): MapLocation[] =>
  [...locations].sort(
    (a, b) => MARKER_STACK_ORDER[a.type] - MARKER_STACK_ORDER[b.type]
  );
