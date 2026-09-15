"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  buildMapPageUrl,
  searchParamsToMapFilters,
  type MapUrlSelection,
} from "@/lib/map/map-url";
import { mergeMapFilters, shouldClearMapSelectionForBrowseView } from "@/lib/map/map-filter-actions";
import { MAP_CITY_BOUNDS } from "@/lib/map/map-bounds";
import type { MapFilters } from "@/lib/map/map-filters";
import type { MapLocation, MapPageData, MapRoute } from "@/lib/map/types";
import { resolveMapLocationSelectionId } from "@/lib/map/map-selection";
import {
  shouldAckUrlWrite,
  shouldApplyUrlHydration,
} from "@/lib/map/map-url-sync";
import {
  buildLocationSelectNavigation,
  buildRouteSelectNavigation,
  isRedundantLocationSelect,
  isRedundantRouteSelect,
} from "@/lib/map/map-selection-navigation";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import {
  useMapStore,
  type MapNavigateParams,
} from "@/app/map/stores/use-map-store";

export const useMapPageState = (initialData: MapPageData) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isUpdatingUrl = useRef(false);
  const isActiveRef = useRef(true);
  const pendingWrittenUrlRef = useRef<string | null>(null);
  const didNormalizePlaceRef = useRef(false);
  const pendingPlaceIdRef = useRef<string | null>(null);
  const pendingRouteIdRef = useRef<string | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const { categorySlugs } = useParticipantCategories();
  const setOptimisticFilters = useMapStore((state) => state.setOptimisticFilters);
  const setNavigation = useMapStore((state) => state.setNavigation);

  const initialLocationId = searchParams.get("place");
  const initialRouteId = searchParams.get("route");
  const initialResolvedPlaceId = initialLocationId
    ? resolveMapLocationSelectionId(initialData.locations, initialLocationId)
    : null;
  const lastSyncedRouteIdRef = useRef<string | null>(initialRouteId);
  const lastSyncedPlaceIdRef = useRef<string | null>(initialResolvedPlaceId);
  const pendingHubMemberIdRef = useRef<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(() => {
    if (!initialLocationId) return null;
    return resolveMapLocationSelectionId(
      initialData.locations,
      initialLocationId
    );
  });
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    initialRouteId
  );
  const [selectedHubMemberId, setSelectedHubMemberId] = useState<string | null>(
    null
  );
  const [activeRouteStopId, setActiveRouteStopId] = useState<string | null>(
    null
  );

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
      pendingWrittenUrlRef.current = null;
      isUpdatingUrl.current = false;
    };
  }, []);

  const clearActiveRouteStop = useCallback(() => {
    setActiveRouteStopId(null);
  }, []);

  const clearSelectionLocal = useCallback(() => {
    pendingPlaceIdRef.current = null;
    pendingRouteIdRef.current = null;
    pendingHubMemberIdRef.current = null;
    lastSyncedPlaceIdRef.current = null;
    setSelectedLocation(null);
    setSelectedHubMemberId(null);
    setSelectedRoute(null);
    setActiveRouteStopId(null);
  }, []);

  const selectLocationLocal = useCallback(
    (locationId: string, memberUserId?: string | null) => {
      pendingPlaceIdRef.current = locationId;
      pendingRouteIdRef.current = null;
      pendingHubMemberIdRef.current = memberUserId ?? null;
      setSelectedLocation(locationId);
      setSelectedHubMemberId(memberUserId ?? null);
      setSelectedRoute(null);
      setActiveRouteStopId(null);
    },
    []
  );

  const selectRouteLocal = useCallback((routeId: string) => {
    pendingPlaceIdRef.current = null;
    pendingRouteIdRef.current = routeId;
    pendingHubMemberIdRef.current = null;
    lastSyncedPlaceIdRef.current = null;
    setSelectedRoute(routeId);
    setSelectedLocation(null);
    setSelectedHubMemberId(null);
    setActiveRouteStopId(null);
  }, []);

  const isWithinBounds = useCallback((lng: number, lat: number) => {
    return (
      lng >= MAP_CITY_BOUNDS[0] &&
      lng <= MAP_CITY_BOUNDS[2] &&
      lat >= MAP_CITY_BOUNDS[1] &&
      lat <= MAP_CITY_BOUNDS[3]
    );
  }, []);

  const locations = useMemo(
    () =>
      initialData.locations.filter((location) =>
        isWithinBounds(location.longitude, location.latitude)
      ),
    [initialData.locations, isWithinBounds]
  );

  const routes = useMemo(
    () =>
      initialData.routes.filter((route) =>
        route.dots.every((dot) => isWithinBounds(dot.longitude, dot.latitude))
      ),
    [initialData.routes, isWithinBounds]
  );

  const navigateMap = useCallback(
    (params: MapNavigateParams) => {
      if (!isActiveRef.current || pathname !== "/map") return;

      isUpdatingUrl.current = true;

      const currentFilters = searchParamsToMapFilters(
        searchParams,
        categorySlugs
      );
      let mergedFilters: MapFilters = params.filters
        ? params.filters
        : params.filterPatch
          ? mergeMapFilters(currentFilters, params.filterPatch)
          : currentFilters;

      let selection: MapUrlSelection | undefined = params.selection;
      if (
        !isLargeScreen &&
        shouldClearMapSelectionForBrowseView(mergedFilters, selection)
      ) {
        selection = { ...selection, clearSelection: true };
      }

      if (params.filters || params.filterPatch) {
        setOptimisticFilters(mergedFilters);
      }

      const mobile = !isLargeScreen;
      // Route-only / place-only mobile URLs drop browse chrome; keep optimistic
      // filters when the routes panel stays open with the selection.
      if (
        mobile &&
        (selection?.place || selection?.route) &&
        mergedFilters.view === "none"
      ) {
        setOptimisticFilters(null);
      }

      const newURL = buildMapPageUrl(
        pathname,
        mergedFilters,
        searchParams,
        selection,
        {
          mobile,
          clearSearch: params.clearSearch,
        }
      );

      if (
        !isActiveRef.current ||
        (typeof window !== "undefined" && window.location.pathname !== "/map")
      ) {
        isUpdatingUrl.current = false;
        return;
      }

      router.replace(newURL, { scroll: false });
      pendingWrittenUrlRef.current = newURL;
    },
    [
      pathname,
      router,
      searchParams,
      categorySlugs,
      isLargeScreen,
      setOptimisticFilters,
    ]
  );

  useEffect(() => {
    if (pathname !== "/map") return;

    if (
      isUpdatingUrl.current &&
      shouldAckUrlWrite({
        writtenUrl: pendingWrittenUrlRef.current,
        currentSearch: searchParams.toString(),
        pathname,
      })
    ) {
      isUpdatingUrl.current = false;
      pendingWrittenUrlRef.current = null;
    }

    const placeId = searchParams.get("place");
    const routeId = searchParams.get("route");
    const hydration = shouldApplyUrlHydration({
      isWriting: isUpdatingUrl.current,
      pendingPlaceId: pendingPlaceIdRef.current,
      pendingRouteId: pendingRouteIdRef.current,
      urlPlace: placeId,
      urlRoute: routeId,
      hasAnySearchParams: Boolean(searchParams.toString()),
    });

    if (hydration.skip) return;

    if (hydration.clear) {
      lastSyncedRouteIdRef.current = null;
      lastSyncedPlaceIdRef.current = null;
      pendingHubMemberIdRef.current = null;
      setSelectedLocation(null);
      setSelectedHubMemberId(null);
      setSelectedRoute(null);
      setActiveRouteStopId(null);
      return;
    }

    if (hydration.applyPlace && placeId) {
      const resolvedPlaceId = resolveMapLocationSelectionId(locations, placeId);
      const placeChanged = lastSyncedPlaceIdRef.current !== resolvedPlaceId;

      pendingPlaceIdRef.current = null;
      lastSyncedRouteIdRef.current = null;

      if (placeChanged) {
        lastSyncedPlaceIdRef.current = resolvedPlaceId;
        setSelectedHubMemberId(pendingHubMemberIdRef.current);
        pendingHubMemberIdRef.current = null;
      }

      setSelectedLocation(resolvedPlaceId);
      setSelectedRoute(null);
      setActiveRouteStopId(null);
      return;
    }

    if (hydration.applyRoute && routeId) {
      pendingRouteIdRef.current = null;
      const routeChanged = lastSyncedRouteIdRef.current !== routeId;
      if (routeChanged) {
        lastSyncedRouteIdRef.current = routeId;
        setActiveRouteStopId(null);
      }
      setSelectedRoute(routeId);
      setSelectedLocation(null);
      lastSyncedPlaceIdRef.current = null;
      pendingHubMemberIdRef.current = null;
      setSelectedHubMemberId(null);
    }
  }, [searchParams, pathname, locations]);

  useEffect(() => {
    if (didNormalizePlaceRef.current) return;
    if (pathname !== "/map") return;

    const placeId = searchParams.get("place");
    if (!placeId) {
      didNormalizePlaceRef.current = true;
      return;
    }

    const resolvedPlaceId = resolveMapLocationSelectionId(locations, placeId);
    didNormalizePlaceRef.current = true;
    if (placeId === resolvedPlaceId) return;

    navigateMap({ selection: { place: resolvedPlaceId } });
  }, [pathname, searchParams, locations, navigateMap]);

  useEffect(() => {
    setNavigation({
      navigateMap,
      clearSelectionLocal,
      selectLocationLocal,
      selectRouteLocal,
    });

    return () => setNavigation(null);
  }, [
    navigateMap,
    clearSelectionLocal,
    selectLocationLocal,
    selectRouteLocal,
    setNavigation,
  ]);

  const clearMapSelection = useCallback(() => {
    if (!isActiveRef.current || pathname !== "/map") return;
    navigateMap({ selection: { clearSelection: true } });
    clearSelectionLocal();
  }, [pathname, navigateMap, clearSelectionLocal]);

  const closeExhibitorSelection = useCallback(() => {
    clearMapSelection();
  }, [clearMapSelection]);

  const clearSelectionIfHidden = useCallback(() => {
    clearMapSelection();
  }, [clearMapSelection]);

  const handleLocationSelect = useCallback(
    (
      locationId: string,
      urlOptions?: {
        clearSearch?: boolean;
        memberUserId?: string;
        source?: "map" | "list" | "search";
      }
    ) => {
      if (!isActiveRef.current || pathname !== "/map") return;

      const resolvedLocationId = locationId
        ? resolveMapLocationSelectionId(locations, locationId)
        : locationId;
      const memberUserId = urlOptions?.memberUserId ?? null;

      const urlPlaceId = searchParams.get("place");
      if (
        isRedundantLocationSelect({
          resolvedLocationId,
          selectedLocation,
          urlPlaceId,
          memberUserId,
          selectedHubMemberId,
        })
      ) {
        return;
      }

      if (!resolvedLocationId) {
        clearMapSelection();
        return;
      }

      selectLocationLocal(resolvedLocationId, memberUserId);

      const currentFilters = searchParamsToMapFilters(
        searchParams,
        categorySlugs
      );

      navigateMap(
        buildLocationSelectNavigation({
          locationId: resolvedLocationId,
          isLargeScreen,
          filters: currentFilters,
          source: urlOptions?.source ?? "map",
          clearSearch: urlOptions?.clearSearch,
        })
      );
    },
    [
      pathname,
      searchParams,
      categorySlugs,
      selectedLocation,
      selectedHubMemberId,
      clearMapSelection,
      selectLocationLocal,
      navigateMap,
      isLargeScreen,
      locations,
    ]
  );

  const handleRouteSelect = useCallback(
    (
      routeId: string,
      options?: { source?: "map" | "list" | "search" }
    ) => {
      if (!isActiveRef.current || pathname !== "/map") return;

      const urlRouteId = searchParams.get("route");
      if (
        isRedundantRouteSelect({
          routeId,
          selectedRoute,
          urlRouteId,
        })
      ) {
        return;
      }

      if (!routeId) {
        clearMapSelection();
        return;
      }

      selectRouteLocal(routeId);

      navigateMap(
        buildRouteSelectNavigation({
          routeId,
          isLargeScreen,
          source: options?.source ?? "map",
        })
      );
    },
    [
      pathname,
      searchParams,
      selectedRoute,
      clearMapSelection,
      selectRouteLocal,
      navigateMap,
      isLargeScreen,
    ]
  );

  return {
    tourMode: initialData.tourMode,
    locations,
    routes,
    selectedLocation,
    selectedHubMemberId,
    selectedRoute,
    activeRouteStopId,
    closeExhibitorSelection,
    clearActiveRouteStop,
    clearSelectionIfHidden,
    setActiveRouteStopId,
    setSelectedLocation: handleLocationSelect,
    setSelectedRoute: handleRouteSelect,
    clearSelectionLocal,
    selectLocationLocal,
    selectRouteLocal,
    navigateMap,
    isWithinBounds,
  };
};

export type { MapLocation, MapRoute, MapPageData };
