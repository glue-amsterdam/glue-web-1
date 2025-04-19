"use client";

import { config } from "@/env";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// City bounding box from environment variables
const CITY_BOUNDS: [number, number, number, number] = [
  Number.parseFloat(config.cityBoundWest || "0"),
  Number.parseFloat(config.cityBoundSouth || "0"),
  Number.parseFloat(config.cityBoundEast || "0"),
  Number.parseFloat(config.cityBoundNorth || "0"),
];

export interface Participant {
  user_id: string;
  user_name: string;
  is_host: boolean;
  slug?: string | null;
  image_url?: string | null;
}

export interface MapInfo {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  participants: Participant[];
  is_hub: boolean;
  hub_name?: string;
  hub_description?: string | null;
  is_collective: boolean;
  is_special_program: boolean;
}

export enum RouteZone {
  NORTH = "NORTH",
  SOUTH = "SOUTH",
  EAST = "EAST",
  WEST = "WEST",
}

export interface Route {
  id: string;
  name: string;
  description: string | null;
  zone: RouteZone;
  user_id: string;
  dots: {
    id: string;
    route_step: number;
    latitude: number;
    longitude: number;
    formatted_address: string;
    user_name: string;
  }[];
}

export function useMapData(initialData: {
  mapInfo: MapInfo[];
  routes: Route[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Referencia para evitar actualizaciones cíclicas
  const isUpdatingUrl = useRef(false);

  // Get initial selection from URL
  const initialLocationId = searchParams.get("place");
  const initialRouteId = searchParams.get("route");

  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    initialLocationId
  );
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    initialRouteId
  );

  // Update state when URL changes
  useEffect(() => {
    // Si estamos en medio de una actualización de URL, no procesamos este cambio
    if (isUpdatingUrl.current) {
      return;
    }

    const placeId = searchParams.get("place");
    const routeId = searchParams.get("route");

    // If URL has no parameters, clear selections
    if (pathname === "/map" && !searchParams.toString()) {
      if (selectedLocation !== null) setSelectedLocation(null);
      if (selectedRoute !== null) setSelectedRoute(null);
      return;
    }

    if (placeId && placeId !== selectedLocation) {
      setSelectedLocation(placeId);
      setSelectedRoute(null);
    } else if (routeId && routeId !== selectedRoute) {
      setSelectedRoute(routeId);
      setSelectedLocation(null);
    } else if (!placeId && !routeId) {
      // Clear selections if no parameters
      setSelectedLocation(null);
      setSelectedRoute(null);
    }
  }, [searchParams, pathname, selectedLocation, selectedRoute]);

  const isWithinBounds = useCallback((lng: number, lat: number) => {
    return (
      lng >= CITY_BOUNDS[0] &&
      lng <= CITY_BOUNDS[2] &&
      lat >= CITY_BOUNDS[1] &&
      lat <= CITY_BOUNDS[3]
    );
  }, []);

  const filteredMapInfo = useMemo(
    () =>
      initialData.mapInfo.filter((location) =>
        isWithinBounds(location.longitude, location.latitude)
      ),
    [initialData.mapInfo, isWithinBounds]
  );

  const filteredRoutes = useMemo(
    () =>
      initialData.routes.filter((route) =>
        route.dots.every((dot) => isWithinBounds(dot.longitude, dot.latitude))
      ),
    [initialData.routes, isWithinBounds]
  );

  // Función para actualizar la URL
  const updateURL = useCallback(
    (params: { place?: string; route?: string }) => {
      // Marcar que estamos actualizando la URL para evitar ciclos
      isUpdatingUrl.current = true;

      try {
        const newSearchParams = new URLSearchParams();

        if (params.place) {
          newSearchParams.set("place", params.place);
        } else if (params.route) {
          newSearchParams.set("route", params.route);
        }

        const newURL = `/map${
          newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""
        }`;

        // Usar replace en lugar de push para evitar entradas duplicadas en el historial
        router.replace(newURL, { scroll: false });
      } finally {
        // Asegurarnos de restablecer la bandera después de un breve retraso
        setTimeout(() => {
          isUpdatingUrl.current = false;
        }, 100);
      }
    },
    [router]
  );

  const handleLocationSelect = useCallback(
    (locationId: string) => {
      // Si se hace clic en la misma ubicación, no hacemos nada
      if (locationId === selectedLocation) return;

      // Actualizamos el estado local
      setSelectedLocation(locationId || null);
      if (locationId) setSelectedRoute(null);

      // Actualizamos la URL solo si hay un ID válido
      if (locationId) {
        updateURL({ place: locationId });
      } else {
        updateURL({});
      }
    },
    [updateURL, selectedLocation, setSelectedRoute]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      // Si se hace clic en la misma ruta, no hacemos nada
      if (routeId === selectedRoute) return;

      // Actualizamos el estado local
      setSelectedRoute(routeId || null);
      if (routeId) setSelectedLocation(null);

      // Actualizamos la URL solo si hay un ID válido
      if (routeId) {
        updateURL({ route: routeId });
      } else {
        updateURL({});
      }
    },
    [updateURL, selectedRoute, setSelectedLocation]
  );

  return {
    mapInfo: filteredMapInfo,
    routes: filteredRoutes,
    selectedLocation,
    selectedRoute,
    setSelectedLocation: handleLocationSelect,
    setSelectedRoute: handleRouteSelect,
    updateURL,
    isWithinBounds,
  };
}
