"use client";

import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import Map, {
  NavigationControl,
  type MapRef,
  Source,
  Layer,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapInfo, Route as RouteType } from "@/app/hooks/useMapData";
import { config } from "@/env";
import { MemoizedMarker } from "@/app/map/memorized-marker";
import MemoizedPopUpComponent from "@/app/map/pop-up-component";
import MemoizedRoutePopupComponent from "@/app/map/route-pop-up";
import MemoizedMapLegend from "@/app/map/map-legend";
import { usePathname, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/hooks/userMediaQuery";

export interface PopupInfo {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  is_hub: boolean;
  is_collective: boolean;
  is_special_program: boolean;
  hub_name?: string;
  hub_description?: string | null;
  participants: {
    user_id: string;
    user_name: string;
    is_host: boolean;
    slug?: string | null;
    image_url?: string | null;
  }[];
}

const CITY_BOUNDS: [number, number, number, number] = [
  Number.parseFloat(config.cityBoundWest || "0"),
  Number.parseFloat(config.cityBoundSouth || "0"),
  Number.parseFloat(config.cityBoundEast || "0"),
  Number.parseFloat(config.cityBoundNorth || "0"),
];

const CITY_CENTER: [number, number] = [
  Number.parseFloat(config.cityCenterLng || "0"),
  Number.parseFloat(config.cityCenterLat || "0"),
];

// Definir constantes para los niveles de zoom
const ZOOM_LEVELS = {
  INITIAL: 12, // Zoom inicial predeterminado
  PARTICIPANT: 13.2, // Zoom más suave para participantes
  ROUTE: 13, // Zoom base para rutas (se ajustará con fitBounds)
};

// Duración de las animaciones de transición
const ANIMATION_DURATION = 1000; // 1 segundo

interface MapComponentProps {
  mapInfo: MapInfo[];
  routes: RouteType[];
  selectedLocation: string | null;
  selectedRoute: string | null;
  onLocationSelect: (locationId: string) => void;
  onRouteSelect: (routeId: string) => void;
}

const MapComponent = ({
  mapInfo,
  routes,
  selectedLocation,
  selectedRoute,
  onLocationSelect,
  onRouteSelect,
}: MapComponentProps) => {
  const mapRef = useRef<MapRef>(null);
  const prevSelectedLocation = useRef<string | null>(null);
  const prevSelectedRoute = useRef<string | null>(null);
  const hadPreviousSelection = useRef<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isResetting = useRef(false);
  const initialLoadDone = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const isNavigatingAway = useRef(false);
  const navigationClickTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get the selected location data from the complete mapInfo
  const selectedLocationData = useMemo(() => {
    if (!selectedLocation) return null;
    return mapInfo.find((location) => location.id === selectedLocation) || null;
  }, [selectedLocation, mapInfo]);

  // Track navigation away from map page
  useEffect(() => {
    if (pathname !== "/map") {
      isNavigatingAway.current = true;
    } else {
      // Reset the flag when we're back on the map page
      isNavigatingAway.current = false;
    }
  }, [pathname]);

  // Also set the flag immediately when component unmounts (navigation happening)
  useEffect(() => {
    return () => {
      isNavigatingAway.current = true;
    };
  }, []);

  // Listen for navigation clicks globally
  useEffect(() => {
    const handleNavigationClick = () => {
      isNavigatingAway.current = true;
      // Clear any existing timeout
      if (navigationClickTimeout.current) {
        clearTimeout(navigationClickTimeout.current);
      }
      // Reset the flag after a short delay
      navigationClickTimeout.current = setTimeout(() => {
        isNavigatingAway.current = false;
      }, 1000);
    };

    // Listen for clicks on navigation elements
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      // Check for home navigation specifically
      if (
        target.closest('a[href="/"]') ||
        target.closest('a[href^="/"]') ||
        target.closest('[data-navigation="true"]')
      ) {
        handleNavigationClick();
      }
    });

    return () => {
      if (navigationClickTimeout.current) {
        clearTimeout(navigationClickTimeout.current);
      }
    };
  }, []);

  // Get the selected route object
  const selectedRouteObject = useMemo(() => {
    if (!selectedRoute) return null;
    return routes.find((r) => r.id === selectedRoute) || null;
  }, [selectedRoute, routes]);

  // Memoized GeoJSON for the selected route
  const routeGeoJSON = useMemo(() => {
    if (!selectedRouteObject) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: selectedRouteObject.dots.map((dot) => [
              dot.longitude,
              dot.latitude,
            ]),
          },
        },
      ],
    };
  }, [selectedRouteObject]);

  // Función para resetear el mapa al estado inicial
  const resetMapToDefault = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: CITY_CENTER,
        zoom: ZOOM_LEVELS.INITIAL,
        duration: ANIMATION_DURATION,
      });
    }
  }, []);

  // Función para centrar el mapa en una ubicación
  const centerMapOnLocation = useCallback(
    (locationId: string, instant = false) => {
      if (!mapRef.current) {
        console.warn("Map reference not available");
        return;
      }

      const location = mapInfo.find((loc) => loc.id === locationId);
      if (!location) {
        console.warn(
          `Location with ID ${locationId} not found in mapInfo array of length ${mapInfo.length}`
        );
        return;
      }

      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: ZOOM_LEVELS.PARTICIPANT,
        duration: instant ? 0 : ANIMATION_DURATION,
      });
    },
    [mapInfo]
  );

  const centerMapOnRoute = useCallback(
    (routeId: string, instant = false) => {
      if (!mapRef.current) {
        console.warn("Map reference not available");
        return;
      }

      const route = routes.find((r) => r.id === routeId);
      if (!route || route.dots.length === 0) {
        console.warn(`Route with ID ${routeId} not found or has no dots`);
        return;
      }

      const coordinates = route.dots.map(
        (dot) => [dot.longitude, dot.latitude] as [number, number]
      );

      const bounds = coordinates.reduce(
        (bounds, coord) => {
          return {
            sw: [
              Math.min(bounds.sw[0], coord[0]),
              Math.min(bounds.sw[1], coord[1]),
            ] as [number, number],
            ne: [
              Math.max(bounds.ne[0], coord[0]),
              Math.max(bounds.ne[1], coord[1]),
            ] as [number, number],
          };
        },
        {
          sw: [coordinates[0][0], coordinates[0][1]] as [number, number],
          ne: [coordinates[0][0], coordinates[0][1]] as [number, number],
        }
      );

      mapRef.current.fitBounds([bounds.sw, bounds.ne], {
        padding: { top: 150, bottom: 150, left: 150, right: 150 },
        duration: instant ? 0 : ANIMATION_DURATION,
      });
    },
    [routes]
  );

  const handlePopupClose = useCallback(() => {
    // Don't clear selections if we're navigating away from the map page
    if (isNavigatingAway.current || pathname !== "/map") {
      return;
    }

    if (selectedLocation) onLocationSelect("");
    if (selectedRoute) onRouteSelect("");
  }, [
    selectedLocation,
    selectedRoute,
    onLocationSelect,
    onRouteSelect,
    pathname,
  ]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  useEffect(() => {
    if (!mapLoaded || initialLoadDone.current) return;

    if (selectedLocation && mapInfo.length > 0) {
      setTimeout(() => {
        centerMapOnLocation(selectedLocation, true);
        initialLoadDone.current = true;
      }, 500);
    } else if (selectedRoute && routes.length > 0) {
      setTimeout(() => {
        centerMapOnRoute(selectedRoute, true);
        initialLoadDone.current = true;
      }, 500);
    } else {
      initialLoadDone.current = true;
    }
  }, [
    mapLoaded,
    selectedLocation,
    selectedRoute,
    centerMapOnLocation,
    centerMapOnRoute,
    mapInfo,
    routes,
  ]);

  // Reset map when URL changes to base /map
  useEffect(() => {
    const isBaseMapUrl = pathname === "/map" && searchParams.toString() === "";

    if (
      isBaseMapUrl &&
      !selectedLocation &&
      !selectedRoute &&
      !isResetting.current
    ) {
      resetMapToDefault();

      prevSelectedLocation.current = null;
      prevSelectedRoute.current = null;
      hadPreviousSelection.current = false;
    }
  }, [
    pathname,
    searchParams,
    resetMapToDefault,
    selectedLocation,
    selectedRoute,
  ]);

  useEffect(() => {
    if (selectedLocation || selectedRoute) {
      hadPreviousSelection.current = true;
    }
  }, [selectedLocation, selectedRoute]);

  useEffect(() => {
    if (
      !selectedLocation &&
      !selectedRoute &&
      hadPreviousSelection.current &&
      !isResetting.current
    ) {
      isResetting.current = true;

      // Resetear el mapa a la vista predeterminada
      resetMapToDefault();

      // Actualizar el estado de selección previa
      hadPreviousSelection.current = false;

      // Restablecer la bandera después de la animación
      setTimeout(() => {
        isResetting.current = false;
      }, ANIMATION_DURATION + 100);
    }
  }, [selectedLocation, selectedRoute, resetMapToDefault]);

  // Auto-focus when selection changes
  useEffect(() => {
    // Evitar procesamiento si estamos en medio de un reset o si el mapa no está cargado
    if (isResetting.current || !mapLoaded) return;

    // Manejar cambios en la selección de ubicación
    if (selectedLocation !== prevSelectedLocation.current) {
      // Guardar la ubicación anterior antes de actualizarla
      prevSelectedLocation.current = selectedLocation;

      if (selectedLocation && mapInfo.length > 0) {
        // Verificar si la ubicación existe en mapInfo
        const locationExists = mapInfo.some(
          (loc) => loc.id === selectedLocation
        );

        if (locationExists) {
          centerMapOnLocation(selectedLocation);
        } else {
          console.warn(
            `Location ${selectedLocation} not found in mapInfo array`
          );
        }
      }
    }

    // Manejar cambios en la selección de ruta
    if (selectedRoute !== prevSelectedRoute.current) {
      prevSelectedRoute.current = selectedRoute;

      if (selectedRoute && routes.length > 0) {
        // Verificar si la ruta existe en routes
        const routeExists = routes.some((r) => r.id === selectedRoute);

        if (routeExists) {
          centerMapOnRoute(selectedRoute);
        } else {
          console.warn(`Route ${selectedRoute} not found in routes array`);
        }
      }
    }
  }, [
    selectedLocation,
    selectedRoute,
    centerMapOnLocation,
    centerMapOnRoute,
    mapLoaded,
    mapInfo,
    routes,
  ]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (
      e: { originalEvent: { stopPropagation: () => void } },
      location: MapInfo
    ) => {
      e.originalEvent.stopPropagation();
      onLocationSelect(location.id);
    },
    [onLocationSelect]
  );

  // Configuración inicial del mapa
  const initialViewState = useMemo(() => {
    // Si hay una ubicación seleccionada y tenemos los datos, usar esas coordenadas
    if (selectedLocation && mapInfo.length > 0) {
      const location = mapInfo.find((loc) => loc.id === selectedLocation);
      if (location) {
        return {
          longitude: location.longitude,
          latitude: location.latitude,
          zoom: ZOOM_LEVELS.PARTICIPANT,
          bearing: 0,
        };
      }
    }

    // De lo contrario, usar la configuración predeterminada
    return {
      longitude: CITY_CENTER[0],
      latitude: CITY_CENTER[1],
      zoom: ZOOM_LEVELS.INITIAL,
      bearing: 0,
    };
  }, [selectedLocation, mapInfo]);

  // Create a conditional click handler that only works when appropriate
  const handleMapClick = useCallback(() => {
    // Don't handle clicks if we're navigating away or not on map page
    if (isNavigatingAway.current || pathname !== "/map") {
      return;
    }

    // Only call handlePopupClose if we have a selection
    if (selectedLocation || selectedRoute) {
      handlePopupClose();
    }
  }, [
    isNavigatingAway,
    pathname,
    selectedLocation,
    selectedRoute,
    handlePopupClose,
  ]);

  // Completely disable map interactions when navigating
  const shouldDisableMapInteractions =
    isNavigatingAway.current || pathname !== "/map";

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={config.mapboxAccesToken}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      maxBounds={CITY_BOUNDS}
      onClick={shouldDisableMapInteractions ? undefined : handleMapClick}
      onMoveEnd={shouldDisableMapInteractions ? undefined : () => {}}
      renderWorldCopies={false}
      onLoad={handleMapLoad}
    >
      <NavigationControl />

      {/* Render location markers when no route is selected */}
      {!selectedRoute &&
        mapInfo.map((location, index) => (
          <MemoizedMarker
            key={location.id}
            location={location}
            onClick={(e) => handleMarkerClick(e, location)}
            isSelected={selectedLocation === location.id}
            index={index}
            mapLoaded={mapLoaded}
          />
        ))}

      {/* Render route line and markers when a route is selected */}
      {selectedRoute && routeGeoJSON && (
        <>
          <Source id="selected-route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="selected-route"
              type="line"
              paint={{
                "line-color": "#007cbf",
                "line-width": 5,
                "line-dasharray": [3, 3],
              }}
            />
          </Source>
          {selectedRouteObject?.dots.map((dot, index) => (
            <MemoizedMarker
              key={dot.id}
              location={{
                id: dot.id,
                longitude: dot.longitude,
                latitude: dot.latitude,
                is_special_program: true, // Use special program marker for route dots
              }}
              isRouteMarker={true} // Mark as route marker to disable click
              routeStep={index + 1} // Pass the route step number
              index={index}
              mapLoaded={mapLoaded}
            />
          ))}
        </>
      )}

      {/* Popup for selected location */}
      {selectedLocation && selectedLocationData && (
        <MemoizedPopUpComponent
          handlePopupClose={handlePopupClose}
          isLoading={false}
          popupInfo={selectedLocationData}
          isError={false}
        />
      )}

      {/* Popup for selected route - only show on desktop */}
      {selectedRoute && selectedRouteObject && isLargeScreen && (
        <MemoizedRoutePopupComponent
          route={selectedRouteObject}
          handlePopupClose={handlePopupClose}
        />
      )}

      {/* Map Legend */}
      <MemoizedMapLegend />
    </Map>
  );
};

export default MapComponent;
