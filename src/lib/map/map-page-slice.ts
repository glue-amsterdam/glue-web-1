import type { MapLocation, MapRoute } from "@/lib/map/types";

export type MapLocationSelectOptions = {
  clearSearch?: boolean;
  memberUserId?: string;
  source?: "map" | "list" | "search";
};

export type MapRouteSelectOptions = {
  source?: "map" | "list" | "search";
};

export type MapPageSelectionHandlers = {
  onLocationSelect: (
    locationId: string,
    options?: MapLocationSelectOptions
  ) => void;
  onRouteSelect: (routeId: string, options?: MapRouteSelectOptions) => void;
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
