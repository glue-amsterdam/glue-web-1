"use client";

import dynamic from "next/dynamic";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useMapPageState } from "@/app/hooks/useMapPageState";
import { useMapFiltersFromUrl } from "@/hooks/useMapFiltersFromUrl";
import {
  filterMapLocationsForList,
  filterMapLocationsForMap,
  filterMapLocationsForSearch,
  filterMapRoutes,
  sortMapLocationsForMarkers,
} from "@/lib/map/map-filters";
import type { MapPageData } from "@/lib/map/types";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";
import { config } from "@/config";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useMapStore } from "./stores/use-map-store";
import type { MapViewHandle } from "./components/map-view";
import RouteFooter from "./components/route-footer";
import MapFilterDesktopSidebar from "@/components/navbar/map-filter-desktop-sidebar";
import ExhibitorFooter from "./components/exhibitor-footer";

const MapView = dynamic(() => import("./components/map-view"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
});

type MapMainProps = {
  initialData: MapPageData;
};

const MapMain = ({ initialData }: MapMainProps) => {
  const {
    tourMode,
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
    setSelectedLocation,
    setSelectedRoute,
  } = useMapPageState(initialData);

  const { filters } = useMapFiltersFromUrl();

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const mapRef = useRef<MapViewHandle>(null);

  const filteredLocationsForList = useMemo(
    () => filterMapLocationsForList(locations, filters),
    [locations, filters]
  );

  const searchFilteredLocations = useMemo(
    () => filterMapLocationsForSearch(locations, filters.q),
    [locations, filters.q]
  );

  const filteredRoutesForList = useMemo(
    () => filterMapRoutes(routes, filters.q),
    [routes, filters.q]
  );

  const mapMarkerLocations = useMemo(() => {
    if (selectedRoute) {
      return sortMapLocationsForMarkers(locations);
    }

    let visible = filterMapLocationsForMap(locations, filters);

    if (selectedLocation) {
      const isSelectedVisible = visible.some(
        (location) => location.id === selectedLocation
      );
      if (!isSelectedVisible) {
        const selected = locations.find(
          (location) => location.id === selectedLocation
        );
        if (selected) {
          visible = [...visible, selected];
        }
      }
    }

    return sortMapLocationsForMarkers(visible);
  }, [locations, filters, selectedRoute, selectedLocation]);

  const setPage = useMapStore((state) => state.setPage);
  const clearPage = useMapStore((state) => state.clearPage);
  const setOptimisticFilters = useMapStore((state) => state.setOptimisticFilters);

  useEffect(() => {
    setPage({
      routes,
      onRouteSelect: setSelectedRoute,
      selectedRoute,
      filteredLocationsForList,
      searchFilteredLocations,
      filteredRoutesForList,
      selectedLocation,
      onLocationSelect: setSelectedLocation,
    });
  }, [
    routes,
    setSelectedRoute,
    selectedRoute,
    filteredLocationsForList,
    searchFilteredLocations,
    filteredRoutesForList,
    selectedLocation,
    setSelectedLocation,
    setPage,
  ]);

  useEffect(() => {
    return () => {
      clearPage();
      setOptimisticFilters(null);
    };
  }, [clearPage, setOptimisticFilters]);

  useEffect(() => {
    if (!selectedLocation || selectedRoute) return;
    const isVisible = mapMarkerLocations.some(
      (location) => location.id === selectedLocation
    );
    if (!isVisible) {
      setSelectedLocation("");
    }
  }, [mapMarkerLocations, selectedLocation, selectedRoute, setSelectedLocation]);

  useEffect(() => {
    if (!selectedRoute) return;
    const exists = routes.some((route) => route.id === selectedRoute);
    if (!exists) {
      setSelectedRoute("");
    }
  }, [routes, selectedRoute, setSelectedRoute]);

  const selectedRouteObject =
    routes.find((route) => route.id === selectedRoute) ?? null;

  const selectedLocationData = useMemo(
    () => locations.find((location) => location.id === selectedLocation) ?? null,
    [locations, selectedLocation]
  );

  const showMobileRouteFooter =
    !isLargeScreen && selectedRouteObject && !detailPanelDismissed;
  const showMobileExhibitorFooter =
    !isLargeScreen &&
    !selectedRoute &&
    selectedLocation &&
    selectedLocationData;

  const handleDownloadRoutePdf = useCallback(
    () => mapRef.current?.downloadSelectedRoutePdf() ?? Promise.resolve(),
    []
  );

  const handleActiveStopChange = useCallback((stop: RouteStopDisplay) => {
    mapRef.current?.focusOnPoint(stop.longitude, stop.latitude);
  }, []);

  const handleRouteStopSelect = useCallback(
    (dotId: string) => {
      if (!selectedRouteObject) return;

      reopenDetailPanel();
      setActiveRouteStopId(dotId);
    },
    [selectedRouteObject, reopenDetailPanel, setActiveRouteStopId]
  );

  return (
    <>
      <h1 className="sr-only">{`GLUE ${config.cityName} map`}</h1>
      <div
        data-map-surface
        className="relative w-full h-[calc(100dvh-var(--total-nav-height))] pt-(--nav-secondary-h) overflow-hidden"
        aria-label="Map"
      >
        <Suspense fallback={<LoadingSpinner />}>
          <MapView
            ref={mapRef}
            locations={mapMarkerLocations}
            routes={routes}
            tourMode={tourMode}
            selectedLocation={selectedLocation}
            selectedRoute={selectedRoute}
            activeRouteStopId={activeRouteStopId}
            detailPanelDismissed={detailPanelDismissed}
            onLocationSelect={setSelectedLocation}
            onCloseExhibitorSelection={closeExhibitorSelection}
            onDismissRoutePanel={dismissRoutePanel}
            onRouteStopSelect={handleRouteStopSelect}
          />
        </Suspense>
        {isLargeScreen && <MapFilterDesktopSidebar />}
      </div>

      {showMobileExhibitorFooter && selectedLocationData && (
        <ExhibitorFooter
          key={selectedLocationData.id}
          location={selectedLocationData}
          tourMode={tourMode}
          onClose={closeExhibitorSelection}
        />
      )}

      {showMobileRouteFooter && selectedRouteObject && (
        <RouteFooter
          route={selectedRouteObject}
          locations={locations}
          tourMode={tourMode}
          activeStopId={activeRouteStopId}
          onActiveStopChange={handleActiveStopChange}
          onDownloadRoutePdf={handleDownloadRoutePdf}
          onClose={dismissRoutePanel}
        />
      )}
    </>
  );
};

export default MapMain;
