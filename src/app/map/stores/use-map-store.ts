"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import type { MapFilters } from "@/lib/map/map-filters";
import type { MapUrlSelection } from "@/lib/map/map-url";
import type { MapLocation, MapRoute } from "@/lib/map/types";

export type MapFilterId = "exhibitors" | "routes" | "category";

export type MapNavigateParams = {
  filters?: MapFilters;
  filterPatch?: Partial<MapFilters>;
  selection?: MapUrlSelection;
  clearSearch?: boolean;
};

export type MapNavigationHandlers = {
  navigateMap: (params: MapNavigateParams) => void;
  clearSelectionLocal: () => void;
  selectLocationLocal: (locationId: string, memberUserId?: string | null) => void;
  selectRouteLocal: (routeId: string) => void;
};

export type MapLocationSelectOptions = {
  clearSearch?: boolean;
  memberUserId?: string;
};

export type MapPageSlice = {
  routes: MapRoute[];
  filteredLocationsForList: MapLocation[];
  searchFilteredLocations: MapLocation[];
  filteredRoutesForList: MapRoute[];
  selectedLocation: string | null;
  selectedRoute: string | null;
  onLocationSelect: (
    locationId: string,
    options?: MapLocationSelectOptions
  ) => void;
  onRouteSelect: (routeId: string) => void;
};

export type MapFilterPanelSlice = {
  openFilter: MapFilterId | null;
  openPanelId: string | null;
  onExhibitorListSelect: (
    locationId: string,
    options?: MapLocationSelectOptions
  ) => void;
  onRouteListSelect: (routeId: string) => void;
  onTypeSelect: (value: ExhibitorsFilterType) => void;
  onRouteSelected: () => void;
};

type MapStoreState = {
  page: MapPageSlice | null;
  filterPanel: MapFilterPanelSlice | null;
  navigation: MapNavigationHandlers | null;
  optimisticFilters: MapFilters | null;
  setPage: (value: MapPageSlice) => void;
  clearPage: () => void;
  setFilterPanel: (value: MapFilterPanelSlice) => void;
  clearFilterPanel: () => void;
  setNavigation: (value: MapNavigationHandlers | null) => void;
  setOptimisticFilters: (value: MapFilters | null) => void;
  reset: () => void;
};

const initialState = {
  page: null as MapPageSlice | null,
  filterPanel: null as MapFilterPanelSlice | null,
  navigation: null as MapNavigationHandlers | null,
  optimisticFilters: null as MapFilters | null,
};

const mapStoreSlice = (set: (partial: Partial<MapStoreState>) => void) => ({
  ...initialState,
  setPage: (value: MapPageSlice) => set({ page: value }),
  clearPage: () => set({ page: null }),
  setFilterPanel: (value: MapFilterPanelSlice) => set({ filterPanel: value }),
  clearFilterPanel: () => set({ filterPanel: null }),
  setNavigation: (value: MapNavigationHandlers | null) => set({ navigation: value }),
  setOptimisticFilters: (value: MapFilters | null) =>
    set({ optimisticFilters: value }),
  reset: () => set({ ...initialState }),
});

export const useMapStore = create<MapStoreState>()(
  process.env.NODE_ENV === "development"
    ? devtools(mapStoreSlice, { name: "MapStore" })
    : mapStoreSlice
);

export const useMapPage = () => useMapStore((state) => state.page);

export const useMapFilterPanel = () => useMapStore((state) => state.filterPanel);

export const useMapNavigation = () => useMapStore((state) => state.navigation);
