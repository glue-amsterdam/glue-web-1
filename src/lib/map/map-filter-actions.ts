import type { MapFilters } from "@/lib/map/map-filters";
import type { MapUrlSelection } from "@/lib/map/map-url";

export const shouldClearMapSelectionForExhibitorsView = (
  merged: MapFilters,
  selection?: MapUrlSelection
): boolean =>
  merged.view === "exhibitors" &&
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
