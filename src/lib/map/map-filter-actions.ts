import {
  DEFAULT_MAP_FILTERS,
  type MapFilters,
  type MapViewMode,
} from "@/lib/map/map-filters";
import type { MapUrlSelection } from "@/lib/map/map-url";

export const shouldClearMapSelectionForBrowseView = (
  merged: MapFilters,
  selection?: MapUrlSelection
): boolean =>
  merged.view !== "none" &&
  !selection?.place &&
  !selection?.route;

export const withExhibitorsView = (
  current: MapFilters,
  patch: Partial<MapFilters>
): MapFilters => ({
  ...current,
  ...patch,
  view: "exhibitors",
});

export const mergeMapFilters = (
  current: MapFilters,
  patch: Partial<MapFilters>
): MapFilters => ({
  ...current,
  ...patch,
});

/** Active browse mode when `view=none` but URL still carries filter params (common on mobile). */
export const getEffectiveMapViewMode = (filters: MapFilters): MapViewMode => {
  if (filters.view !== "none") return filters.view;
  if (filters.type !== "all") return "category";
  if (filters.q.trim()) return "exhibitors";
  return "none";
};

export const buildOpenMapViewPatch = (
  filters: MapFilters,
  view: MapViewMode
): Partial<MapFilters> => ({
  view,
  ...getSwitchViewPatch(getEffectiveMapViewMode(filters), view),
});

/** Params to reset when closing a browse view via toggle. */
export const getClearPatchForView = (
  view: MapViewMode
): Partial<MapFilters> => {
  if (view === "category") {
    return { type: DEFAULT_MAP_FILTERS.type };
  }

  if (view === "exhibitors") {
    return { q: DEFAULT_MAP_FILTERS.q };
  }

  return {};
};

/** Params to reset when switching from one browse view to another. */
export const getSwitchViewPatch = (
  from: MapViewMode,
  to: MapViewMode
): Partial<MapFilters> => {
  if (from === to || from === "none") {
    return {};
  }

  const patch: Partial<MapFilters> = {
    ...getClearPatchForView(from),
  };

  if (to === "category") {
    patch.q = DEFAULT_MAP_FILTERS.q;
  }

  if (to === "exhibitors") {
    patch.type = DEFAULT_MAP_FILTERS.type;
  }

  if (to === "routes") {
    patch.type = DEFAULT_MAP_FILTERS.type;
    patch.q = DEFAULT_MAP_FILTERS.q;
  }

  return patch;
};
