import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import { normalizeCategorySlug } from "@/lib/participants/participant-categories";
import {
  DEFAULT_MAP_FILTERS,
  type MapFilters,
  type MapViewMode,
} from "@/lib/map/map-filters";

const VALID_VIEWS: MapViewMode[] = [
  "none",
  "exhibitors",
  "routes",
  "category",
];

export const parseMapFilterType = (
  value: string | null,
  validSlugs: string[]
): ExhibitorsFilterType => {
  if (!value || value === "all") {
    return "all";
  }

  const normalized = normalizeCategorySlug(value);
  if (validSlugs.includes(normalized)) {
    return normalized;
  }

  return DEFAULT_MAP_FILTERS.type;
};

const parseView = (value: string | null): MapViewMode => {
  if (value && VALID_VIEWS.includes(value as MapViewMode)) {
    return value as MapViewMode;
  }
  return DEFAULT_MAP_FILTERS.view;
};

export const searchParamsToMapFilters = (
  searchParams: URLSearchParams,
  validSlugs: string[] = []
): MapFilters => ({
  view: parseView(searchParams.get("view")),
  type: parseMapFilterType(searchParams.get("type"), validSlugs),
  q: searchParams.get("q")?.trim() ?? "",
});

export const appendMapFilterParams = (
  searchParams: URLSearchParams,
  filters: MapFilters
): URLSearchParams => {
  const next = new URLSearchParams(searchParams.toString());

  if (filters.view !== DEFAULT_MAP_FILTERS.view) {
    next.set("view", filters.view);
  } else {
    next.delete("view");
  }

  if (filters.type !== DEFAULT_MAP_FILTERS.type) {
    next.set("type", filters.type);
  } else {
    next.delete("type");
  }

  if (filters.q.trim()) {
    next.set("q", filters.q.trim());
  } else {
    next.delete("q");
  }

  return next;
};

export type MapUrlSelection = {
  place?: string;
  route?: string;
  clearSelection?: boolean;
};

export type BuildMapPageUrlOptions = {
  /** Mobile: route-only URL when selecting a route. */
  mobile?: boolean;
  /** Mobile place from search: also drop `q`. */
  clearSearch?: boolean;
};

export const buildMapPageUrl = (
  pathname: string,
  filters: MapFilters,
  currentSearchParams: URLSearchParams,
  selection?: MapUrlSelection,
  options?: BuildMapPageUrlOptions
): string => {
  if (
    options?.mobile &&
    selection?.route &&
    !selection?.place &&
    !selection?.clearSelection
  ) {
    return `${pathname}?route=${encodeURIComponent(selection.route)}`;
  }

  let resolvedFilters = filters;

  if (options?.mobile && selection?.place) {
    resolvedFilters = { ...resolvedFilters, view: "none" };
    if (options.clearSearch) {
      resolvedFilters = { ...resolvedFilters, q: "" };
    }
  }

  const searchParams = appendMapFilterParams(
    new URLSearchParams(currentSearchParams.toString()),
    resolvedFilters
  );

  if (selection?.clearSelection) {
    searchParams.delete("place");
    searchParams.delete("route");
  } else if (selection?.place) {
    searchParams.set("place", selection.place);
    searchParams.delete("route");
  } else if (selection?.route) {
    searchParams.set("route", selection.route);
    searchParams.delete("place");
  }

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export const isMapPageActive = (): boolean =>
  typeof window !== "undefined" && window.location.pathname === "/map";
