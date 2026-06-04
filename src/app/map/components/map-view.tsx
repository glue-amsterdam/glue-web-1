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
  type MapMouseEvent,
} from "react-map-gl/mapbox-legacy";
import "mapbox-gl/dist/mapbox-gl.css";
import { config } from "@/config";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import type { MapLocation, MapRoute, MapTourMode } from "@/lib/map/types";
import { MAP_CITY_BOUNDS, MAP_CITY_CENTER } from "@/lib/map/map-bounds";
import {
  focusMapOnPoint,
  focusMapOnRoute,
} from "@/lib/map/map-viewport-focus";
import {
  focusExhibitorWithPopupLayout,
  focusWithPopupLayout,
  getExhibitorPopupLayout,
} from "@/lib/map/exhibitor-popup-layout";
import type { ExhibitorPopupAnchor } from "@/lib/map/exhibitor-popup-layout";
import { measureMapBottomInset } from "@/lib/map/map-viewport-insets";
import { composeRoutePrintMapDataUrl } from "@/lib/map/route-static-map";
import { downloadRoutePdf } from "@/lib/map/route-pdf";
import { getRouteStopsForDisplay } from "@/lib/map/route-stop-display";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";
import {
  buildLocationsGeoJSON,
  buildRouteStopsGeoJSON,
  DEFAULT_MAP_THEME_COLORS,
  getMapThemeColorsFromDocument,
  type MapThemeColors,
} from "@/lib/map/locations-geojson";
import RoutePopup from "./route-popup";
import {
  MapPointLayers,
  EXHIBITOR_STACK_TYPES,
  MAP_LOCATIONS_LAYER_PREFIX,
  MAP_LOCATIONS_SOURCE_ID,
  MAP_POINT_INTERACTIVE_LAYER_IDS,
  MAP_ROUTE_STOPS_LAYER_PREFIX,
  MAP_ROUTE_STOPS_SOURCE_ID,
  ROUTE_STOP_STACK_TYPES,
} from "./map-point-layers";
import ExhibitorPopup from "./exhibitor-popup";
import { useMapFilterPanel } from "../stores/use-map-store";

type ExhibitorPopupLayoutState = {
  anchor: ExhibitorPopupAnchor;
  offset: [number, number];
};

const isRouteStopLayer = (layerId: string) =>
  layerId.startsWith(MAP_ROUTE_STOPS_LAYER_PREFIX);

const ZOOM_LEVELS = { INITIAL: 12.5 } as const;
const MAP_STYLE_URI = "mapbox://styles/mapbox/light-v11";
const RESIZE_DEBOUNCE_MS = 150;

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
  routes: MapRoute[];
  tourMode: MapTourMode;
  selectedLocation: string | null;
  selectedRoute: string | null;
  activeRouteStopId: string | null;
  detailPanelDismissed: boolean;
  onLocationSelect: (locationId: string) => void;
  onCloseExhibitorSelection: () => void;
  onDismissRoutePanel: () => void;
  onRouteStopSelect: (dotId: string) => void;
};

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    locations,
    routes,
    tourMode,
    selectedLocation,
    selectedRoute,
    activeRouteStopId,
    detailPanelDismissed,
    onLocationSelect,
    onCloseExhibitorSelection,
    onDismissRoutePanel,
    onRouteStopSelect,
  },
  forwardedRef
) {
  const mapRef = useRef<MapRef>(null);
  const pathname = usePathname();
  const initialPlaceIdRef = useRef(selectedLocation);
  const initialViewStateRef = useRef<MapInitialViewState | null>(null);
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFocusLocationRef = useRef<string | null>(null);
  const prevFeatureStateLocationRef = useRef<string | null>(null);
  const prevSelectedRouteRef = useRef<string | null>(null);
  const initialFocusDoneRef = useRef(false);

  if (!initialViewStateRef.current) {
    initialViewStateRef.current = buildInitialViewState(
      locations,
      initialPlaceIdRef.current
    );
  }

  const [mapLoaded, setMapLoaded] = useState(false);
  const [themeColors, setThemeColors] = useState<MapThemeColors>(
    DEFAULT_MAP_THEME_COLORS
  );
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const filterPanel = useMapFilterPanel();
  const [exhibitorPopupLayout, setExhibitorPopupLayout] =
    useState<ExhibitorPopupLayoutState | null>(null);
  const [routePopupLayout, setRoutePopupLayout] =
    useState<ExhibitorPopupLayoutState | null>(null);

  useEffect(() => {
    setThemeColors(getMapThemeColorsFromDocument());
  }, []);

  const locationsGeoJSON = useMemo(
    () => buildLocationsGeoJSON(locations, themeColors),
    [locations, themeColors]
  );

  const selectedLocationData = useMemo(
    () => locations.find((loc) => loc.id === selectedLocation) ?? null,
    [selectedLocation, locations]
  );

  const selectedRouteObject = useMemo(
    () => routes.find((route) => route.id === selectedRoute) ?? null,
    [selectedRoute, routes]
  );

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
    return buildRouteStopsGeoJSON(selectedRouteObject, locations, themeColors);
  }, [selectedRouteObject, locations, themeColors]);

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
    const stops = getRouteStopsForDisplay(selectedRouteObject, locations);
    if (stops.length === 0) return;

    try {
      const mapDataUrl = await composeRoutePrintMapDataUrl(
        selectedRouteObject,
        stops,
        config.mapboxAccesToken,
        mapRef.current?.getMap(),
        themeColors.primaryColor
      );
      downloadRoutePdf(selectedRouteObject, mapDataUrl, stops);
    } catch (error) {
      console.error("Route PDF generation failed:", error);
    }
  }, [selectedRouteObject, mapLoaded, locations, themeColors.primaryColor]);

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
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (!isLargeScreen) {
        focusOnPoint(stop.longitude, stop.latitude, instant);
        return;
      }

      const layout = focusWithPopupLayout(
        map,
        stop.longitude,
        stop.latitude,
        {
          sidebarOpen: Boolean(filterPanel?.openFilter),
          bottomInset: getFocusBottomPadding(),
        },
        { instant }
      );

      setRoutePopupLayout({
        anchor: layout.anchor,
        offset: layout.offset,
      });
    },
    [isLargeScreen, focusOnPoint, filterPanel?.openFilter, getFocusBottomPadding]
  );

  const focusOnRoute = useCallback(
    (route: MapRoute, instant = false) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const stops = getRouteStopsForDisplay(route, locations);
      const firstStop = stops[0];
      if (!firstStop) return;

      if (!isLargeScreen) {
        setRoutePopupLayout(null);
        focusMapOnRoute(map, route, {
          instant,
          padding: { bottom: getFocusBottomPadding() },
        });
        return;
      }

      const layoutOptions = {
        sidebarOpen: Boolean(filterPanel?.openFilter),
        bottomInset: getFocusBottomPadding(),
      };

      const initialLayout = getExhibitorPopupLayout(
        map,
        firstStop.longitude,
        firstStop.latitude,
        layoutOptions
      );

      focusMapOnRoute(map, route, {
        instant,
        padding: initialLayout.focusPadding,
      });

      focusOnRouteStop(firstStop, instant);
    },
    [
      isLargeScreen,
      locations,
      getFocusBottomPadding,
      filterPanel?.openFilter,
      focusOnRouteStop,
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
    onCloseExhibitorSelection();
  }, [pathname, onCloseExhibitorSelection]);

  const handleRoutePopupClose = useCallback(() => {
    if (pathname !== "/map") return;
    onDismissRoutePanel();
  }, [pathname, onDismissRoutePanel]);

  const handleDetailPanelDismiss = useCallback(() => {
    if (selectedLocation) {
      onCloseExhibitorSelection();
      return;
    }
    if (selectedRoute) {
      onDismissRoutePanel();
    }
  }, [
    selectedLocation,
    selectedRoute,
    onCloseExhibitorSelection,
    onDismissRoutePanel,
  ]);

  const handleMapLoad = useCallback(
    (event: MapEvent) => {
      const map = event.target;
      setThemeColors(getMapThemeColorsFromDocument());
      setMapLoaded(true);

      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = new ResizeObserver(() => {
        scheduleMapResize(map);
      });
      resizeObserverRef.current.observe(map.getContainer());
    },
    [scheduleMapResize]
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
      } else {
        setRoutePopupLayout(null);
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

  useEffect(() => {
    if (!mapLoaded || selectedRoute) return;

    const map = mapRef.current?.getMap();
    if (!map?.getSource(MAP_LOCATIONS_SOURCE_ID)) return;

    const sourceId = MAP_LOCATIONS_SOURCE_ID;
    const prevId = prevFeatureStateLocationRef.current;

    if (prevId && prevId !== selectedLocation) {
      map.removeFeatureState({ source: sourceId, id: prevId }, "selected");
    }

    if (selectedLocation) {
      map.setFeatureState(
        { source: sourceId, id: selectedLocation },
        { selected: true }
      );
      prevFeatureStateLocationRef.current = selectedLocation;
      return;
    }

    if (prevId) {
      map.removeFeatureState({ source: sourceId, id: prevId }, "selected");
    }
    prevFeatureStateLocationRef.current = null;
  }, [mapLoaded, selectedLocation, selectedRoute, locationsGeoJSON]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (pathname !== "/map") return;

      const interactiveFeature = event.features?.find((feature) => {
        const layerId = feature.layer?.id;
        return (
          layerId !== undefined &&
          MAP_POINT_INTERACTIVE_LAYER_IDS.includes(
            layerId as (typeof MAP_POINT_INTERACTIVE_LAYER_IDS)[number]
          )
        );
      });

      if (interactiveFeature && selectedRoute) {
        const layerId = interactiveFeature.layer?.id;
        if (layerId && isRouteStopLayer(layerId)) {
          const dotId =
            interactiveFeature.id ??
            interactiveFeature.properties?.id;
          if (dotId) {
            onRouteStopSelect(String(dotId));
            return;
          }
        }
      }

      if (interactiveFeature && !selectedRoute) {
        const locationId = interactiveFeature.properties?.locationId;
        if (locationId) {
          onLocationSelect(String(locationId));
          return;
        }
      }

      if (selectedLocation || selectedRoute) {
        handleDetailPanelDismiss();
      }
    },
    [
      pathname,
      selectedRoute,
      selectedLocation,
      onLocationSelect,
      onRouteStopSelect,
      handleDetailPanelDismiss,
    ]
  );

  return (
    <MapGL
      ref={mapRef}
      mapboxAccessToken={config.mapboxAccesToken}
      initialViewState={initialViewStateRef.current}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE_URI}
      maxBounds={MAP_CITY_BOUNDS}
      interactiveLayerIds={[...MAP_POINT_INTERACTIVE_LAYER_IDS]}
      onClick={pathname === "/map" ? handleMapClick : undefined}
      renderWorldCopies={false}
      onLoad={handleMapLoad}
    >
      {/* Zoom controls disabled for now, but can be added back in if needed */}
      {/* <NavigationControl /> */}

      {!selectedRoute && (
        <MapPointLayers
          sourceId={MAP_LOCATIONS_SOURCE_ID}
          layerIdPrefix={MAP_LOCATIONS_LAYER_PREFIX}
          stackTypes={EXHIBITOR_STACK_TYPES}
          data={locationsGeoJSON}
          colors={themeColors}
          showPointerCursor
        />
      )}

      {selectedRoute && routeGeoJSON && selectedRouteObject && routeStopsGeoJSON && (
        <>
          <Source id="selected-route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="selected-route-line"
              type="line"
              paint={{
                "line-color": themeColors.primaryColor,
                "line-width": 5,
                "line-dasharray": [3, 3],
              }}
            />
          </Source>
          <MapPointLayers
            sourceId={MAP_ROUTE_STOPS_SOURCE_ID}
            layerIdPrefix={MAP_ROUTE_STOPS_LAYER_PREFIX}
            stackTypes={ROUTE_STOP_STACK_TYPES}
            data={routeStopsGeoJSON}
            colors={themeColors}
            showPointerCursor
          />
        </>
      )}

      {selectedLocation &&
        selectedLocationData &&
        isLargeScreen &&
        exhibitorPopupLayout && (
          <ExhibitorPopup
            location={selectedLocationData}
            tourMode={tourMode}
            anchor={exhibitorPopupLayout.anchor}
            offset={exhibitorPopupLayout.offset}
            onClose={handleLocationPopupClose}
          />
        )}

      {selectedRoute &&
        selectedRouteObject &&
        isLargeScreen &&
        routePopupLayout &&
        !detailPanelDismissed && (
          <RoutePopup
            route={selectedRouteObject}
            locations={locations}
            tourMode={tourMode}
            anchor={routePopupLayout.anchor}
            offset={routePopupLayout.offset}
            activeStopId={activeRouteStopId}
            onActiveStopChange={focusOnRouteStop}
            onClose={handleRoutePopupClose}
            onDownloadRoutePdf={downloadSelectedRoutePdf}
          />
        )}
    </MapGL>
  );
});

export default MapView;
