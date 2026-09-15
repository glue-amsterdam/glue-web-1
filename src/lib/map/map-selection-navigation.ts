import type { MapFilters } from "@/lib/map/map-filters";
import type { MapNavigateParams } from "@/app/map/stores/use-map-store";

export type LocationSelectSource = "map" | "list" | "search";

export const isRedundantLocationSelect = ({
  resolvedLocationId,
  selectedLocation,
  urlPlaceId,
  memberUserId,
  selectedHubMemberId,
}: {
  resolvedLocationId: string | null;
  selectedLocation: string | null;
  urlPlaceId: string | null;
  memberUserId: string | null;
  selectedHubMemberId: string | null;
}): boolean =>
  Boolean(
    resolvedLocationId &&
      resolvedLocationId === selectedLocation &&
      urlPlaceId === resolvedLocationId &&
      memberUserId === selectedHubMemberId
  );

export const buildLocationSelectNavigation = ({
  locationId,
  isLargeScreen,
  filters,
  source,
  clearSearch = false,
}: {
  locationId: string;
  isLargeScreen: boolean;
  filters: MapFilters;
  source: LocationSelectSource;
  clearSearch?: boolean;
}): MapNavigateParams => {
  if (source === "search") {
    return {
      filterPatch: isLargeScreen
        ? { q: "", type: "all" }
        : { view: "none", q: "", type: "all" },
      selection: { place: locationId },
      clearSearch: clearSearch || !isLargeScreen,
    };
  }

  if (source === "list") {
    const keepCategoryView = isLargeScreen && filters.view === "category";
    return {
      filterPatch: keepCategoryView
        ? { view: "category", type: filters.type }
        : isLargeScreen
          ? { view: "exhibitors" }
          : { view: "none", type: filters.type },
      selection: { place: locationId },
    };
  }

  let filterPatch: Partial<MapFilters> | undefined;
  let resolvedClearSearch = clearSearch;

  if (!isLargeScreen) {
    filterPatch = { view: "none" };
    if (filters.view === "category" && filters.type !== "all") {
      filterPatch.type = filters.type;
    }
    if (clearSearch || filters.q.trim()) {
      filterPatch.q = "";
      resolvedClearSearch = true;
    }
  } else if (filters.view === "category") {
    filterPatch = {
      view: "category",
      type: filters.type,
    };
  }

  return {
    filterPatch,
    selection: { place: locationId },
    clearSearch: resolvedClearSearch,
  };
};

export const isRedundantRouteSelect = ({
  routeId,
  selectedRoute,
  urlRouteId,
}: {
  routeId: string;
  selectedRoute: string | null;
  urlRouteId: string | null;
}): boolean => routeId === selectedRoute && urlRouteId === routeId;

export type RouteSelectSource = "map" | "list" | "search";

export const buildRouteSelectNavigation = ({
  routeId,
  isLargeScreen: _isLargeScreen,
  source: _source,
}: {
  routeId: string;
  isLargeScreen: boolean;
  source: RouteSelectSource;
}): MapNavigateParams => {
  // Always pin browse mode to routes. A stale category/exhibitors URL (or a
  // partial patch that only cleared `q`) would reopen the wrong panel via the
  // navbar's filters.view → openFilter sync.
  return {
    filterPatch: { view: "routes", q: "", type: "all" },
    selection: { route: routeId },
  };
};
