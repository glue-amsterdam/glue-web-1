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
import { useMediaQuery } from "@/hooks/userMediaQuery";
import {
  useMapStore,
  type MapNavigateParams,
} from "@/app/map/stores/use-map-store";

const URL_UPDATE_GUARD_MS = 100;

export const useMapPageState = (initialData: MapPageData) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isUpdatingUrl = useRef(false);
  const isActiveRef = useRef(true);
  const urlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didNormalizePlaceRef = useRef(false);
  const pendingPlaceIdRef = useRef<string | null>(null);
  const pendingRouteIdRef = useRef<string | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
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
  const [detailPanelDismissed, setDetailPanelDismissed] = useState(false);
  const [activeRouteStopId, setActiveRouteStopId] = useState<string | null>(
    null
  );

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
        urlUpdateTimeoutRef.current = null;
      }
      isUpdatingUrl.current = false;
    };
  }, []);

  const dismissRoutePanel = useCallback(() => {
    setDetailPanelDismissed(true);
  }, []);

  const reopenDetailPanel = useCallback(() => {
    setDetailPanelDismissed(false);
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
    setDetailPanelDismissed(false);
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
      setDetailPanelDismissed(false);
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
    setDetailPanelDismissed(false);
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

      const currentFilters = searchParamsToMapFilters(searchParams);
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
      if (mobile && (selection?.place || selection?.route)) {
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

      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
      urlUpdateTimeoutRef.current = setTimeout(() => {
        urlUpdateTimeoutRef.current = null;
        if (isActiveRef.current) {
          isUpdatingUrl.current = false;
        }
      }, URL_UPDATE_GUARD_MS);
    },
    [
      pathname,
      router,
      searchParams,
      isLargeScreen,
      setOptimisticFilters,
    ]
  );

  useEffect(() => {
    if (isUpdatingUrl.current) return;
    if (pathname !== "/map") return;

    const placeId = searchParams.get("place");
    const routeId = searchParams.get("route");

    if (!searchParams.toString()) {
      lastSyncedRouteIdRef.current = null;
      lastSyncedPlaceIdRef.current = null;
      pendingHubMemberIdRef.current = null;
      setSelectedLocation(null);
      setSelectedHubMemberId(null);
      setSelectedRoute(null);
      setActiveRouteStopId(null);
      setDetailPanelDismissed(false);
      return;
    }

    if (placeId) {
      if (pendingRouteIdRef.current) return;

      const resolvedPlaceId = resolveMapLocationSelectionId(locations, placeId);
      const placeChanged = lastSyncedPlaceIdRef.current !== resolvedPlaceId;

      pendingPlaceIdRef.current = null;
      lastSyncedRouteIdRef.current = null;

      if (placeChanged) {
        lastSyncedPlaceIdRef.current = resolvedPlaceId;
        setSelectedHubMemberId(pendingHubMemberIdRef.current);
        pendingHubMemberIdRef.current = null;
        setDetailPanelDismissed(false);
      }

      setSelectedLocation(resolvedPlaceId);
      setSelectedRoute(null);
      setActiveRouteStopId(null);
      return;
    }

    if (routeId) {
      if (pendingPlaceIdRef.current) return;

      pendingRouteIdRef.current = null;
      if (lastSyncedRouteIdRef.current !== routeId) {
        setDetailPanelDismissed(false);
        lastSyncedRouteIdRef.current = routeId;
      }
      setSelectedRoute(routeId);
      setSelectedLocation(null);
      lastSyncedPlaceIdRef.current = null;
      pendingHubMemberIdRef.current = null;
      setSelectedHubMemberId(null);
      setActiveRouteStopId(null);
      return;
    }

    if (pendingPlaceIdRef.current || pendingRouteIdRef.current) return;
    lastSyncedRouteIdRef.current = null;
    lastSyncedPlaceIdRef.current = null;
    pendingHubMemberIdRef.current = null;
    setSelectedLocation(null);
    setSelectedHubMemberId(null);
    setSelectedRoute(null);
    setActiveRouteStopId(null);
    setDetailPanelDismissed(false);
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
      urlOptions?: { clearSearch?: boolean; memberUserId?: string }
    ) => {
      if (!isActiveRef.current || pathname !== "/map") return;

      const resolvedLocationId = locationId
        ? resolveMapLocationSelectionId(locations, locationId)
        : locationId;
      const memberUserId = urlOptions?.memberUserId ?? null;

      const urlPlaceId = searchParams.get("place");
      if (
        resolvedLocationId &&
        resolvedLocationId === selectedLocation &&
        urlPlaceId === resolvedLocationId &&
        memberUserId === selectedHubMemberId
      ) {
        return;
      }

      if (!resolvedLocationId) {
        clearMapSelection();
        return;
      }

      selectLocationLocal(resolvedLocationId, memberUserId);

      const filterPatch: Partial<MapFilters> | undefined = !isLargeScreen
        ? {
            view: "none",
            ...(urlOptions?.clearSearch ? { q: "" } : {}),
          }
        : undefined;

      navigateMap({
        filterPatch,
        selection: { place: resolvedLocationId },
        clearSearch: urlOptions?.clearSearch,
      });
    },
    [
      pathname,
      searchParams,
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
    (routeId: string) => {
      if (!isActiveRef.current || pathname !== "/map") return;

      const urlRouteId = searchParams.get("route");
      if (routeId === selectedRoute && urlRouteId === routeId) {
        if (routeId) setDetailPanelDismissed(false);
        return;
      }

      if (!routeId) {
        clearMapSelection();
        return;
      }

      selectRouteLocal(routeId);

      navigateMap({
        filterPatch: isLargeScreen ? { q: "" } : undefined,
        selection: { route: routeId },
      });
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
    detailPanelDismissed,
    activeRouteStopId,
    dismissRoutePanel,
    closeExhibitorSelection,
    clearSelectionIfHidden,
    reopenDetailPanel,
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
