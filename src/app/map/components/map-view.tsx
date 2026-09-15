"use client";

import {
  forwardRef,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import MapGL, {
  type MapRef,
  Source,
  Layer,
  type MapEvent,
} from "react-map-gl/mapbox-legacy";
import "mapbox-gl/dist/mapbox-gl.css";
import { config } from "@/config";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import type { MapLocation, MapRoute, MapTourMode } from "@/lib/map/types";
import { resolveMapLocationSelectionId } from "@/lib/map/map-selection";
import { getSingleCategoryMatchMemberUserId } from "@/lib/map/map-filters";
import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import type { MapLocationSelectOptions } from "@/app/map/stores/use-map-store";
import { MAP_CITY_BOUNDS, MAP_CITY_CENTER } from "@/lib/map/map-bounds";
import {
  focusMapOnPoint,
  focusMapOnRoute,
  getMapFocusPadding,
} from "@/lib/map/map-viewport-focus";
import {
  focusExhibitorWithPopupLayout,
  MAP_FILTER_SIDEBAR_WIDTH_PX,
} from "@/lib/map/exhibitor-popup-layout";
import type { ExhibitorPopupAnchor } from "@/lib/map/exhibitor-popup-layout";
import { measureMapBottomInset } from "@/lib/map/map-viewport-insets";
import { composeRoutePrintMapDataUrl } from "@/lib/map/route-static-map";
import { buildGlueLogoSrc } from "@/lib/map/route-print-logo";
import {
  formatEventDateRange,
  type RoutePrintProps,
} from "@/lib/map/route-print-props";
import { getRouteStopsForDisplay } from "@/lib/map/route-stop-display";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";
import { RoutePrintHost } from "@/components/map/route-print-host";
import { useEventsDays } from "@/context/MainContext";
import {
  buildLocationsGeoJSON,
  buildRouteStopsGeoJSON,
  getMapThemeColorsFromDocument,
  type MapThemeColors,
} from "@/lib/map/locations-geojson";
import { getMapPointMarkerVariant } from "@/lib/map/map-point-marker-spec";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import type { MapPointFeature } from "@/lib/map/locations-geojson";
import MapMarkers from "./map-markers";
import ExhibitorPopup from "./exhibitor-popup";
import { useMapFilterPanel } from "../stores/use-map-store";

type ExhibitorPopupLayoutState = {
  anchor: ExhibitorPopupAnchor;
  offset: [number, number];
};

const ZOOM_LEVELS = { INITIAL: 12.5 } as const;
const MAP_STYLE_URI = "mapbox://styles/mapbox/light-v11";
const RESIZE_DEBOUNCE_MS = 150;
/** 2× inactive SlideLineNav thickness (1px / lg:2px). */
const SELECTED_ROUTE_LINE_WIDTH = { mobile: 2, desktop: 4 } as const;

type MapInitialViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
};

const buildInitialViewState = (
  locations: MapLocation[],
  initialPlaceId: string | null
): MapInitialViewState => {
  if (initialPlaceId) {
    const location = locations.find((loc) => loc.id === initialPlaceId);
    if (location) {
      return {
        longitude: location.longitude,
        latitude: location.latitude,
        zoom: ZOOM_LEVELS.INITIAL,
        bearing: 0,
      };
    }
  }

  return {
    longitude: MAP_CITY_CENTER[0],
    latitude: MAP_CITY_CENTER[1],
    zoom: ZOOM_LEVELS.INITIAL,
    bearing: 0,
  };
};

export type MapViewHandle = {
  downloadSelectedRoutePdf: () => Promise<void>;
  focusOnPoint: (longitude: number, latitude: number, instant?: boolean) => void;
  focusOnRoute: (route: MapRoute, instant?: boolean) => void;
  focusOnRouteStop: (stop: RouteStopDisplay, instant?: boolean) => void;
};

type MapViewProps = {
  locations: MapLocation[];
  /** Full location set for resolving hub fallback selection (defaults to `locations`). */
  selectionLocations?: MapLocation[];
  routes: MapRoute[];
  tourMode: MapTourMode;
  selectedLocation: string | null;
  selectedHubMemberId?: string | null;
  selectedRoute: string | null;
  activeRouteStopId: string | null;
  detailPanelDismissed: boolean;
  categoryFilterType?: ExhibitorsFilterType;
  onLocationSelect: (
    locationId: string,
    options?: MapLocationSelectOptions
  ) => void;
  onCloseExhibitorSelection: () => void;
  onClearActiveRouteStop: () => void;
  onDismissRoutePanel: () => void;
  onRouteStopSelect: (dotId: string) => void;
};

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    locations,
    selectionLocations: selectionLocationsProp,
    routes,
    tourMode,
    selectedLocation,
    selectedHubMemberId = null,
    selectedRoute,
    activeRouteStopId,
    detailPanelDismissed: _detailPanelDismissed,
    categoryFilterType = "all",
    onLocationSelect,
    onCloseExhibitorSelection,
    onClearActiveRouteStop,
    onDismissRoutePanel,
    onRouteStopSelect,
  },
  forwardedRef
) {
  const mapRef = useRef<MapRef>(null);
  const pathname = usePathname();
  const selectionLocations = selectionLocationsProp ?? locations;
  const initialPlaceIdRef = useRef(selectedLocation);
  const initialViewStateRef = useRef<MapInitialViewState | null>(null);
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFocusLocationRef = useRef<string | null>(null);
  const prevSelectedRouteRef = useRef<string | null>(null);
  const prevActiveRouteStopIdRef = useRef<string | null>(null);
  const initialFocusDoneRef = useRef(false);

  if (!initialViewStateRef.current) {
    initialViewStateRef.current = buildInitialViewState(
      selectionLocations,
      initialPlaceIdRef.current
    );
  }

  const { categorySlugs } = useParticipantCategories();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [routePrintProps, setRoutePrintProps] =
    useState<RoutePrintProps | null>(null);
  const eventDays = useEventsDays();
  const eventDate = useMemo(
    () => formatEventDateRange(eventDays),
    [eventDays]
  );
  const [themeColors, setThemeColors] = useState<MapThemeColors>(() =>
    getMapThemeColorsFromDocument(categorySlugs)
  );
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isMdScreen = useMediaQuery("(min-width: 768px)");
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const markerVariant = getMapPointMarkerVariant(isMdScreen, isLargeScreen);
  const filterPanel = useMapFilterPanel();
  const [exhibitorPopupLayout, setExhibitorPopupLayout] =
    useState<ExhibitorPopupLayoutState | null>(null);

  useEffect(() => {
    setThemeColors(getMapThemeColorsFromDocument(categorySlugs));
  }, [categorySlugs]);

  const locationsGeoJSON = useMemo(
    () => buildLocationsGeoJSON(locations, themeColors, markerVariant),
    [locations, themeColors, markerVariant]
  );

  const selectedLocationData = useMemo(() => {
    if (!selectedLocation) return null;

    const resolvedId = resolveMapLocationSelectionId(
      selectionLocations,
      selectedLocation
    );
    return (
      selectionLocations.find((location) => location.id === resolvedId) ??
      locations.find((location) => location.id === resolvedId) ??
      null
    );
  }, [selectedLocation, selectionLocations, locations]);

  const selectedRouteObject = useMemo(
    () => routes.find((route) => route.id === selectedRoute) ?? null,
    [selectedRoute, routes]
  );

  const activeStopLocation = useMemo(() => {
    if (!selectedRouteObject || !activeRouteStopId) return null;

    const stop = getRouteStopsForDisplay(
      selectedRouteObject,
      selectionLocations
    ).find((item) => item.dotId === activeRouteStopId);
    if (!stop) return null;

    const resolvedId = resolveMapLocationSelectionId(
      selectionLocations,
      stop.mapInfoId
    );
    return (
      selectionLocations.find((location) => location.id === resolvedId) ??
      locations.find((location) => location.id === resolvedId) ??
      null
    );
  }, [
    selectedRouteObject,
    activeRouteStopId,
    selectionLocations,
    locations,
  ]);

  const popupExhibitorLocation = selectedRoute
    ? activeStopLocation
    : selectedLocationData;

  const routeGeoJSON = useMemo(() => {
    if (!selectedRouteObject) return null;
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: selectedRouteObject.dots.map((dot) => [
              dot.longitude,
              dot.latitude,
            ]),
          },
          properties: {},
        },
      ],
    };
  }, [selectedRouteObject]);

  const routeStopsGeoJSON = useMemo(() => {
    if (!selectedRouteObject) return null;
    return buildRouteStopsGeoJSON(
      selectedRouteObject,
      locations,
      themeColors,
      markerVariant
    );
  }, [selectedRouteObject, locations, themeColors, markerVariant]);

  const scheduleMapResize = useCallback((map: MapboxMap) => {
    if (resizeDebounceRef.current) {
      clearTimeout(resizeDebounceRef.current);
    }
    resizeDebounceRef.current = setTimeout(() => {
      map.resize();
      resizeDebounceRef.current = null;
    }, RESIZE_DEBOUNCE_MS);
  }, []);

  const downloadSelectedRoutePdf = useCallback(async () => {
    if (!selectedRouteObject || !mapLoaded) return;
    const stops = getRouteStopsForDisplay(
      selectedRouteObject,
      locations,
      themeColors
    );
    if (stops.length === 0) return;

    try {
      const mapDataUrl = await composeRoutePrintMapDataUrl(
        selectedRouteObject,
        stops,
        config.mapboxAccesToken,
        themeColors.primaryColor
      );
      setRoutePrintProps({
        routeName: selectedRouteObject.name,
        routeDescription: selectedRouteObject.description ?? undefined,
        mapImageDataUrl: mapDataUrl,
        stops,
        primaryColor: themeColors.primaryColor,
        logoSrc: buildGlueLogoSrc(themeColors.primaryColor),
        eventDate,
      });
    } catch (error) {
      console.error("Route print generation failed:", error);
    }
  }, [
    selectedRouteObject,
    mapLoaded,
    locations,
    themeColors,
    eventDate,
  ]);

  const handleRoutePrintComplete = useCallback(() => {
    setRoutePrintProps(null);
  }, []);

  const getFocusBottomPadding = useCallback(() => {
    return measureMapBottomInset();
  }, []);

  const focusOnPoint = useCallback(
    (longitude: number, latitude: number, instant = false) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      focusMapOnPoint(map, longitude, latitude, {
        instant,
        padding: { bottom: getFocusBottomPadding() },
      });
    },
    [getFocusBottomPadding]
  );

  const focusOnRouteStop = useCallback(
    (stop: RouteStopDisplay, instant = false) => {
      focusOnPoint(stop.longitude, stop.latitude, instant);
    },
    [focusOnPoint]
  );

  const focusOnRoute = useCallback(
    (route: MapRoute, instant = false) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const basePadding = getMapFocusPadding(getFocusBottomPadding());
      const sidebarOpen = isLargeScreen && Boolean(filterPanel?.openFilter);

      focusMapOnRoute(map, route, {
        instant,
        padding: {
          ...basePadding,
          left:
            basePadding.left +
            (sidebarOpen ? MAP_FILTER_SIDEBAR_WIDTH_PX : 0),
        },
      });
    },
    [
      isLargeScreen,
      getFocusBottomPadding,
      filterPanel?.openFilter,
    ]
  );

  const focusOnExhibitor = useCallback(
    (location: MapLocation) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (!isLargeScreen) {
        setExhibitorPopupLayout(null);
        focusOnPoint(location.longitude, location.latitude, true);
        return;
      }

      const layout = focusExhibitorWithPopupLayout(
        map,
        location.longitude,
        location.latitude,
        { sidebarOpen: Boolean(filterPanel?.openFilter) }
      );

      setExhibitorPopupLayout({
        anchor: layout.anchor,
        offset: layout.offset,
      });
    },
    [isLargeScreen, focusOnPoint, filterPanel?.openFilter]
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      downloadSelectedRoutePdf,
      focusOnPoint,
      focusOnRoute,
      focusOnRouteStop,
    }),
    [downloadSelectedRoutePdf, focusOnPoint, focusOnRoute, focusOnRouteStop]
  );

  const handleLocationPopupClose = useCallback(() => {
    if (pathname !== "/map") return;
    if (selectedRoute) {
      onClearActiveRouteStop();
      setExhibitorPopupLayout(null);
      return;
    }
    onCloseExhibitorSelection();
  }, [
    pathname,
    selectedRoute,
    onClearActiveRouteStop,
    onCloseExhibitorSelection,
  ]);

  const handleDetailPanelDismiss = useCallback(() => {
    if (activeRouteStopId) {
      onClearActiveRouteStop();
      setExhibitorPopupLayout(null);
      return;
    }
    if (selectedLocation) {
      onCloseExhibitorSelection();
      return;
    }
    if (selectedRoute) {
      onDismissRoutePanel();
    }
  }, [
    activeRouteStopId,
    selectedLocation,
    selectedRoute,
    onClearActiveRouteStop,
    onCloseExhibitorSelection,
    onDismissRoutePanel,
  ]);

  const handleMapLoad = useCallback(
    (event: MapEvent) => {
      const map = event.target;
      setThemeColors(getMapThemeColorsFromDocument(categorySlugs));
      setMapLoaded(true);

      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = new ResizeObserver(() => {
        scheduleMapResize(map);
      });
      resizeObserverRef.current.observe(map.getContainer());
    },
    [scheduleMapResize, categorySlugs]
  );

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      if (resizeDebounceRef.current) {
        clearTimeout(resizeDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || initialFocusDoneRef.current) return;

    if (selectedLocation) {
      const location = locations.find((loc) => loc.id === selectedLocation);
      if (location) {
        focusOnExhibitor(location);
        initialFocusDoneRef.current = true;
      }
      return;
    }

    if (selectedRoute && selectedRouteObject) {
      focusOnRoute(selectedRouteObject, true);
      initialFocusDoneRef.current = true;
      return;
    }

    initialFocusDoneRef.current = true;
  }, [
    mapLoaded,
    selectedLocation,
    selectedRoute,
    selectedRouteObject,
    locations,
    focusOnExhibitor,
    focusOnRoute,
  ]);

  useEffect(() => {
    prevActiveRouteStopIdRef.current = null;
  }, [selectedRoute]);

  useEffect(() => {
    if (!mapLoaded || !selectedRouteObject || !activeRouteStopId) return;
    if (activeRouteStopId === prevActiveRouteStopIdRef.current) return;

    prevActiveRouteStopIdRef.current = activeRouteStopId;

    const stops = getRouteStopsForDisplay(
      selectedRouteObject,
      selectionLocations
    );
    const stop = stops.find((item) => item.dotId === activeRouteStopId);
    if (!stop) return;

    if (isLargeScreen) {
      const resolvedId = resolveMapLocationSelectionId(
        selectionLocations,
        stop.mapInfoId
      );
      const location =
        selectionLocations.find((item) => item.id === resolvedId) ??
        locations.find((item) => item.id === resolvedId) ??
        null;
      if (location) {
        focusOnExhibitor(location);
        return;
      }
    }

    focusOnRouteStop(stop, true);
  }, [
    mapLoaded,
    selectedRouteObject,
    activeRouteStopId,
    selectionLocations,
    locations,
    isLargeScreen,
    focusOnExhibitor,
    focusOnRouteStop,
  ]);

  useEffect(() => {
    if (activeRouteStopId) return;
    if (!selectedRoute) return;
    setExhibitorPopupLayout(null);
  }, [activeRouteStopId, selectedRoute]);

  useEffect(() => {
    if (!mapLoaded || !initialFocusDoneRef.current) return;

    if (selectedLocation !== prevFocusLocationRef.current) {
      prevFocusLocationRef.current = selectedLocation;

      if (selectedLocation) {
        const location = locations.find((loc) => loc.id === selectedLocation);
        if (location) {
          focusOnExhibitor(location);
        }
      } else {
        setExhibitorPopupLayout(null);
      }
    }

    if (selectedRoute !== prevSelectedRouteRef.current) {
      prevSelectedRouteRef.current = selectedRoute;

      if (selectedRoute && selectedRouteObject) {
        focusOnRoute(selectedRouteObject, true);
      }
    }
  }, [
    mapLoaded,
    selectedLocation,
    selectedRoute,
    selectedRouteObject,
    locations,
    focusOnExhibitor,
    focusOnRoute,
  ]);

  const handleMarkerClick = useCallback(
    (feature: MapPointFeature) => {
      if (pathname !== "/map") return;

      if (selectedRoute) {
        onRouteStopSelect(feature.properties.id);
        return;
      }

      const locationId = feature.properties.locationId;

      if (categoryFilterType !== "all") {
        const location = selectionLocations.find((loc) => loc.id === locationId);
        if (location?.hubId) {
          const memberUserId = getSingleCategoryMatchMemberUserId(
            location,
            categoryFilterType
          );
          if (memberUserId) {
            onLocationSelect(locationId, { memberUserId });
            return;
          }
        }
      }

      onLocationSelect(locationId);
    },
    [
      pathname,
      selectedRoute,
      categoryFilterType,
      selectionLocations,
      onRouteStopSelect,
      onLocationSelect,
    ]
  );

  const handleMapClick = useCallback(() => {
    // Dot clicks are handled by the HTML markers (which stop propagation), so a
    // click that reaches the map itself means the user clicked empty space.
    if (pathname !== "/map") return;

    if (activeRouteStopId || selectedLocation || selectedRoute) {
      handleDetailPanelDismiss();
    }
  }, [
    pathname,
    activeRouteStopId,
    selectedLocation,
    selectedRoute,
    handleDetailPanelDismiss,
  ]);

  return (
    <>
      <MapGL
        ref={mapRef}
        mapboxAccessToken={config.mapboxAccesToken}
        initialViewState={initialViewStateRef.current}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE_URI}
        maxBounds={MAP_CITY_BOUNDS}
        onClick={pathname === "/map" ? handleMapClick : undefined}
        renderWorldCopies={false}
        onLoad={handleMapLoad}
      >
        {!selectedRoute && (
          <MapMarkers
            data={locationsGeoJSON}
            variant={markerVariant}
            selectedId={selectedLocation}
            onMarkerClick={handleMarkerClick}
          />
        )}

        {selectedRoute &&
          routeGeoJSON &&
          selectedRouteObject &&
          routeStopsGeoJSON && (
            <>
              <Source id="selected-route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="selected-route-line"
                  type="line"
                  paint={{
                    "line-color": themeColors.primaryColor,
                    "line-width": isLargeScreen
                      ? SELECTED_ROUTE_LINE_WIDTH.desktop
                      : SELECTED_ROUTE_LINE_WIDTH.mobile,
                    "line-dasharray": [8, 4],
                  }}
                />
              </Source>
              <MapMarkers
                data={routeStopsGeoJSON}
                variant={markerVariant}
                selectedId={activeRouteStopId}
                onMarkerClick={handleMarkerClick}
              />
            </>
          )}

        {popupExhibitorLocation &&
          isLargeScreen &&
          exhibitorPopupLayout && (
            <ExhibitorPopup
              key={
                selectedRoute
                  ? `route-stop-${activeRouteStopId}`
                  : selectedLocation
              }
              location={popupExhibitorLocation}
              tourMode={tourMode}
              selectedHubMemberId={selectedRoute ? null : selectedHubMemberId}
              anchor={exhibitorPopupLayout.anchor}
              offset={exhibitorPopupLayout.offset}
              onClose={handleLocationPopupClose}
            />
          )}
      </MapGL>
      <RoutePrintHost
        printProps={routePrintProps}
        onPrintComplete={handleRoutePrintComplete}
      />
    </>
  );
});

export default MapView;
