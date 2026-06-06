import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { MapLocation, MapRoute } from "@/lib/map/types";
import { getMapLocationMarkerStackTier } from "./map-location-display";

/** Lower = behind; higher = on top (Mapbox circle/symbol sort-key). */
export const MARKER_STACK_ORDER: Record<ExhibitorType, number> = {
  hub: 0,
  "up-to-three-participants": 1,
  "special-program": 2,
};

const MARKER_STACK_ORDER_ROUTE = 0;

export const getMarkerSortKey = (location: MapLocation, index: number): number => {
  const tier = getMapLocationMarkerStackTier(location);
  return tier * 1000 + index;
};

export const getRouteMarkerSortKey = (index: number): number =>
  MARKER_STACK_ORDER_ROUTE * 1000 + index;

export type MapViewMode = "none" | "exhibitors" | "routes" | "category";

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

const hasDisplayNumber = (location: MapLocation): boolean =>
  Boolean(location.displayNumber?.trim());

const compareDisplayNumbers = (a: string, b: string): number => {
  const aNum = Number(a);
  const bNum = Number(b);
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
    return aNum - bNum;
  }
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
};

const compareMapLocationNames = (a: MapLocation, b: MapLocation): number =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

/** Exhibitors list: by displayNumber ascending; without number, alphabetical at end. */
export const sortMapLocationsForDisplayList = (
  locations: MapLocation[]
): MapLocation[] =>
  [...locations].sort((left, right) => {
    const leftHasNumber = hasDisplayNumber(left);
    const rightHasNumber = hasDisplayNumber(right);

    if (leftHasNumber && rightHasNumber) {
      return compareDisplayNumbers(
        left.displayNumber!.trim(),
        right.displayNumber!.trim()
      );
    }

    if (!leftHasNumber && !rightHasNumber) {
      return compareMapLocationNames(left, right);
    }

    return leftHasNumber ? -1 : 1;
  });

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

  const result = locations.filter((location) =>
    locationMatchesSearchQuery(location, query)
  );

  return sortMapLocationsForDisplayList(result);
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

  return sortMapLocationsForDisplayList(
    filterMapLocations(locations, { type: filters.type, q: "" })
  );
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
      (route.zone?.toLowerCase().includes(query) ?? false) ||
      (route.description?.toLowerCase().includes(query) ?? false) ||
      route.dots.some((dot) => dot.name.toLowerCase().includes(query))
  );
};

/** Ascending stack tier: solo exhibitors first in source, full hubs last (drawn on top in hub layer). */
export const sortMapLocationsForMarkers = (
  locations: MapLocation[]
): MapLocation[] =>
  [...locations].sort(
    (a, b) =>
      getMapLocationMarkerStackTier(a) - getMapLocationMarkerStackTier(b)
  );
