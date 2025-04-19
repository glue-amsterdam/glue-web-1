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
import { useLocationData } from "@/app/hooks/useLocationData";
import { usePathname, useSearchParams } from "next/navigation";

export interface PopupInfo {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  is_hub: boolean;
  is_collective: boolean;
  is_special_program: boolean;
  hub_name: string | null;
  hub_description: string | null;
  participants: {
    user_id: string;
    user_name: string;
    is_host: boolean;
    slug: string | null;
    image_url: string | null;
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
  const { locationData, isLoading, isError } =
    useLocationData(selectedLocation);
  const prevSelectedLocation = useRef<string | null>(null);
  const prevSelectedRoute = useRef<string | null>(null);
  const hadPreviousSelection = useRef<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isResetting = useRef(false);
  const initialLoadDone = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      console.log("Ejecutando resetMapToDefault");
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

      console.log(`Centering map on location: ${locationId}`, {
        instant,
        coords: [location.longitude, location.latitude],
        zoom: ZOOM_LEVELS.PARTICIPANT,
      });

      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: ZOOM_LEVELS.PARTICIPANT,
        duration: instant ? 0 : ANIMATION_DURATION,
      });
    },
    [mapInfo]
  );

  // Función para centrar el mapa en una ruta
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

      console.log(
        `Centering map on route: ${routeId}`,
        instant ? "(instant)" : ""
      );

      // Para rutas, ajustar los límites para mostrar toda la ruta
      const coordinates = route.dots.map(
        (dot) => [dot.longitude, dot.latitude] as [number, number]
      );

      // Calcular límites
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

      // Añadir padding a los límites para una mejor visualización
      mapRef.current.fitBounds([bounds.sw, bounds.ne], {
        padding: { top: 150, bottom: 150, left: 150, right: 150 },
        duration: instant ? 0 : ANIMATION_DURATION,
      });
    },
    [routes]
  );

  // Handle popup close
  const handlePopupClose = useCallback(() => {
    if (selectedLocation) onLocationSelect("");
    if (selectedRoute) onRouteSelect("");
  }, [selectedLocation, selectedRoute, onLocationSelect, onRouteSelect]);

  // Prefetch nearby locations for faster loading
  const prefetchNearbyLocations = useCallback(() => {
    // Get visible locations based on current view
    const mapBounds = mapRef.current?.getBounds();
    const visibleLocations = mapInfo.filter((location) => {
      const lng = location.longitude;
      const lat = location.latitude;

      // Simple check if location is in current viewport
      return (
        mapBounds &&
        lng >= mapBounds.getWest() &&
        lng <= mapBounds.getEast() &&
        lat >= mapBounds.getSouth() &&
        lat <= mapBounds.getNorth()
      );
    });

    // Prefetch data for visible locations (limit to 5 to avoid too many requests)
    visibleLocations.slice(0, 5).forEach((location) => {
      // This will trigger SWR prefetch
      fetch(`/api/mapbox/location/${location.id}`, { priority: "low" });
    });
  }, [mapInfo]);

  // Manejar el evento de carga del mapa
  const handleMapLoad = useCallback(() => {
    console.log("Map loaded");
    setMapLoaded(true);
  }, []);

  // Efecto para manejar la carga inicial con parámetros en la URL
  useEffect(() => {
    // Solo ejecutar cuando el mapa esté cargado y no se haya hecho la carga inicial
    if (!mapLoaded || initialLoadDone.current) return;

    console.log("Checking initial load conditions:", {
      mapLoaded,
      initialLoadDone: initialLoadDone.current,
      selectedLocation,
      selectedRoute,
      mapInfoLength: mapInfo.length,
    });

    // Verificar si hay una ubicación o ruta seleccionada en la carga inicial
    if (selectedLocation && mapInfo.length > 0) {
      console.log("Initial load with selected location:", selectedLocation);

      // Pequeño retraso para asegurar que el mapa esté completamente listo
      setTimeout(() => {
        centerMapOnLocation(selectedLocation, true);
        initialLoadDone.current = true;
        console.log("Initial location centering complete");
      }, 500);
    } else if (selectedRoute && routes.length > 0) {
      console.log("Initial load with selected route:", selectedRoute);

      // Pequeño retraso para asegurar que el mapa esté completamente listo
      setTimeout(() => {
        centerMapOnRoute(selectedRoute, true);
        initialLoadDone.current = true;
        console.log("Initial route centering complete");
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
    // Verificar si la URL es exactamente "/map" (sin parámetros)
    const isBaseMapUrl = pathname === "/map" && searchParams.toString() === "";

    console.log("URL check:", {
      pathname,
      searchParams: searchParams.toString(),
      isBaseMapUrl,
      selectedLocation,
      selectedRoute,
    });

    if (
      isBaseMapUrl &&
      !selectedLocation &&
      !selectedRoute &&
      !isResetting.current
    ) {
      console.log(
        "Resetting map to default view - URL is /map with no params and no selections"
      );
      // Reset to initial view
      resetMapToDefault();

      // Reset refs
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

  // Efecto para detectar cuando se tenía una selección previa
  useEffect(() => {
    if (selectedLocation || selectedRoute) {
      hadPreviousSelection.current = true;
    }
  }, [selectedLocation, selectedRoute]);

  // Efecto para resetear el mapa cuando no hay selecciones
  useEffect(() => {
    // Si no hay selecciones activas pero había una selección previa
    if (
      !selectedLocation &&
      !selectedRoute &&
      hadPreviousSelection.current &&
      !isResetting.current
    ) {
      console.log(
        "Resetting map to default view - No selections but had previous"
      );
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
      console.log("Location selection changed:", {
        from: prevSelectedLocation.current,
        to: selectedLocation,
        mapLoaded,
        mapInfoLength: mapInfo.length,
      });

      // Guardar la ubicación anterior antes de actualizarla
      prevSelectedLocation.current = selectedLocation;

      if (selectedLocation && mapInfo.length > 0) {
        // Verificar si la ubicación existe en mapInfo
        const locationExists = mapInfo.some(
          (loc) => loc.id === selectedLocation
        );
        console.log(
          `Location ${selectedLocation} exists in mapInfo: ${locationExists}`
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
      console.log("Route selection changed:", {
        from: prevSelectedRoute.current,
        to: selectedRoute,
        mapLoaded,
        routesLength: routes.length,
      });

      prevSelectedRoute.current = selectedRoute;

      if (selectedRoute && routes.length > 0) {
        // Verificar si la ruta existe en routes
        const routeExists = routes.some((r) => r.id === selectedRoute);
        console.log(`Route ${selectedRoute} exists in routes: ${routeExists}`);

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
      console.log("Marker clicked:", location.id);
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
        console.log(
          "Setting initial view state to selected location:",
          selectedLocation
        );
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

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={config.mapboxAccesToken}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      maxBounds={CITY_BOUNDS}
      onClick={handlePopupClose}
      onMoveEnd={prefetchNearbyLocations}
      renderWorldCopies={false}
      onLoad={handleMapLoad}
    >
      <NavigationControl />

      {/* Render location markers when no route is selected */}
      {!selectedRoute &&
        mapInfo.map((location) => (
          <MemoizedMarker
            key={location.id}
            location={location}
            onClick={(e) => handleMarkerClick(e, location)}
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
          {selectedRouteObject?.dots.map((dot) => (
            <MemoizedMarker
              key={dot.id}
              location={{
                id: dot.id,
                longitude: dot.longitude,
                latitude: dot.latitude,
                is_special_program: true, // Use special program marker for route dots
              }}
              isRouteMarker={true} // Mark as route marker to disable click
            />
          ))}
        </>
      )}

      {/* Popup for selected location */}
      {selectedLocation && locationData && (
        <MemoizedPopUpComponent
          handlePopupClose={handlePopupClose}
          isLoading={isLoading}
          popupInfo={locationData}
          isError={isError}
        />
      )}

      {/* Popup for selected route - with offset to avoid covering dots */}
      {selectedRoute && selectedRouteObject && (
        <MemoizedRoutePopupComponent
          route={selectedRouteObject}
          handlePopupClose={handlePopupClose}
        />
      )}
    </Map>
  );
};

export default MapComponent;
