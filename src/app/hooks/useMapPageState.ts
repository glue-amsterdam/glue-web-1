"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  buildMapPageUrl,
  isMapPageActive,
  searchParamsToMapFilters,
  type MapUrlSelection,
} from "@/lib/map/map-url";
import { mergeMapFilters, shouldClearMapSelectionForBrowseView } from "@/lib/map/map-filter-actions";
import { MAP_CITY_BOUNDS } from "@/lib/map/map-bounds";
import type { MapFilters } from "@/lib/map/map-filters";
import type { MapLocation, MapPageData, MapRoute } from "@/lib/map/types";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import {
  useMapStore,
  type MapNavigateParams,
} from "@/app/map/stores/use-map-store";

export const useMapPageState = (initialData: MapPageData) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isUpdatingUrl = useRef(false);
  const pendingPlaceIdRef = useRef<string | null>(null);
  const pendingRouteIdRef = useRef<string | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const setOptimisticFilters = useMapStore((state) => state.setOptimisticFilters);
  const setNavigation = useMapStore((state) => state.setNavigation);

  const initialLocationId = searchParams.get("place");
  const initialRouteId = searchParams.get("route");

  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    initialLocationId
  );
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    initialRouteId
  );
  const [detailPanelDismissed, setDetailPanelDismissed] = useState(false);
  const [activeRouteStopId, setActiveRouteStopId] = useState<string | null>(
    null
  );

  const dismissRoutePanel = useCallback(() => {
    setDetailPanelDismissed(true);
  }, []);

  const reopenDetailPanel = useCallback(() => {
    setDetailPanelDismissed(false);
  }, []);

  const clearSelectionLocal = useCallback(() => {
    pendingPlaceIdRef.current = null;
    pendingRouteIdRef.current = null;
    setSelectedLocation(null);
    setSelectedRoute(null);
    setActiveRouteStopId(null);
    setDetailPanelDismissed(false);
  }, []);

  const selectLocationLocal = useCallback((locationId: string) => {
    pendingPlaceIdRef.current = locationId;
    pendingRouteIdRef.current = null;
    setSelectedLocation(locationId);
    setSelectedRoute(null);
    setActiveRouteStopId(null);
    setDetailPanelDismissed(false);
  }, []);

  const selectRouteLocal = useCallback((routeId: string) => {
    pendingPlaceIdRef.current = null;
    pendingRouteIdRef.current = routeId;
    setSelectedRoute(routeId);
    setSelectedLocation(null);
    setActiveRouteStopId(null);
    setDetailPanelDismissed(false);
  }, []);

  useEffect(() => {
    if (isUpdatingUrl.current) return;
    if (pathname !== "/map") return;

    const placeId = searchParams.get("place");
    const routeId = searchParams.get("route");

    if (!searchParams.toString()) {
      if (selectedLocation !== null) setSelectedLocation(null);
      if (selectedRoute !== null) setSelectedRoute(null);
      setActiveRouteStopId(null);
      setDetailPanelDismissed(false);
      return;
    }

    if (placeId) {
      if (pendingRouteIdRef.current) return;

      pendingPlaceIdRef.current = null;
      if (selectedLocation !== placeId) setSelectedLocation(placeId);
      if (selectedRoute !== null) setSelectedRoute(null);
      setActiveRouteStopId(null);
      setDetailPanelDismissed(false);
      return;
    }

    if (routeId) {
      pendingRouteIdRef.current = null;

      if (selectedLocation && !placeId) return;

      if (selectedRoute !== routeId) setSelectedRoute(routeId);
      if (selectedLocation !== null) setSelectedLocation(null);
      setActiveRouteStopId(null);
      setDetailPanelDismissed(false);
      return;
    }

    if (pendingPlaceIdRef.current || pendingRouteIdRef.current) return;
    if (selectedLocation !== null) setSelectedLocation(null);
    if (selectedRoute !== null) setSelectedRoute(null);
    setActiveRouteStopId(null);
    setDetailPanelDismissed(false);
  }, [searchParams, pathname, selectedLocation, selectedRoute]);

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
      if (!isMapPageActive()) return;
      if (pathname !== "/map") return;

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

      isUpdatingUrl.current = true;
      try {
        const mobile = !isLargeScreen;
        if (
          mobile &&
          (selection?.place || selection?.route) &&
          !params.filters &&
          !params.filterPatch
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
        router.replace(newURL, { scroll: false });
      } finally {
        setTimeout(() => {
          isUpdatingUrl.current = false;
        }, 100);
      }
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

  const closeExhibitorSelection = useCallback(() => {
    if (!isMapPageActive()) return;
    if (pathname !== "/map") return;
    clearSelectionLocal();
    navigateMap({ selection: { clearSelection: true } });
  }, [pathname, clearSelectionLocal, navigateMap]);

  const handleLocationSelect = useCallback(
    (locationId: string, urlOptions?: { clearSearch?: boolean }) => {
      if (pathname !== "/map") return;

      const urlPlaceId = searchParams.get("place");
      if (locationId === selectedLocation && urlPlaceId === locationId) {
        return;
      }

      if (!locationId) {
        clearSelectionLocal();
        navigateMap({ selection: { clearSelection: true } });
        return;
      }

      selectLocationLocal(locationId);

      const filterPatch: Partial<MapFilters> | undefined = !isLargeScreen
        ? {
            view: "none",
            ...(urlOptions?.clearSearch ? { q: "" } : {}),
          }
        : undefined;

      navigateMap({
        filterPatch,
        selection: { place: locationId },
        clearSearch: urlOptions?.clearSearch,
      });
    },
    [
      pathname,
      searchParams,
      selectedLocation,
      clearSelectionLocal,
      selectLocationLocal,
      navigateMap,
      isLargeScreen,
    ]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      if (pathname !== "/map") return;

      const urlRouteId = searchParams.get("route");
      if (routeId === selectedRoute && urlRouteId === routeId) {
        if (routeId) setDetailPanelDismissed(false);
        return;
      }

      if (!routeId) {
        clearSelectionLocal();
        navigateMap({ selection: { clearSelection: true } });
        return;
      }

      selectRouteLocal(routeId);

      navigateMap({
        filterPatch: isLargeScreen ? { q: "" } : { view: "none" },
        selection: { route: routeId },
      });
    },
    [
      pathname,
      searchParams,
      selectedRoute,
      clearSelectionLocal,
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
    selectedRoute,
    detailPanelDismissed,
    activeRouteStopId,
    dismissRoutePanel,
    closeExhibitorSelection,
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
