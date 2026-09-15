import type { MapLocation, MapRoute } from "@/lib/map/types";

export type MapPageSelectionHandlers = {
  onLocationSelect: (locationId: string, options?: unknown) => void;
  onRouteSelect: (routeId: string, options?: unknown) => void;
  onDownloadSelectedRoute: () => void | Promise<void>;
};

export type MapPageSliceData = {
  routes: MapRoute[];
  filteredLocationsForList: MapLocation[];
  searchFilteredLocations: MapLocation[];
  filteredRoutesForList: MapRoute[];
  selectedLocation: string | null;
  selectedRoute: string | null;
} & MapPageSelectionHandlers;

export const EMPTY_MAP_PAGE_SLICE: MapPageSliceData = {
  routes: [],
  filteredLocationsForList: [],
  searchFilteredLocations: [],
  filteredRoutesForList: [],
  selectedLocation: null,
  selectedRoute: null,
  onLocationSelect: () => {},
  onRouteSelect: () => {},
  onDownloadSelectedRoute: () => {},
};

export const mergeMapPageSlice = (
  current: MapPageSliceData | null,
  patch: Partial<MapPageSliceData>
): MapPageSliceData => ({
  ...(current ?? EMPTY_MAP_PAGE_SLICE),
  ...patch,
});
