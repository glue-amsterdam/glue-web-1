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
  display_number?: string | null;
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
  display_number?: string | null;
  hub_display_number?: string | null;
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

export function useMapData(
  initialData: {
    mapInfo: MapInfo[];
    routes: Route[];
  },
  canAccessRoutes = false,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Referencia para evitar actualizaciones cíclicas
  const isUpdatingUrl = useRef(false);

  // Get initial selection from URL
  const initialLocationId = searchParams.get("place");
  const initialRouteId = searchParams.get("route");

  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    initialLocationId,
  );
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    initialRouteId,
  );

  useEffect(() => {
    if (pathname !== "/map") return;

    if (canAccessRoutes) return;

    const routeId = searchParams.get("route");
    if (!routeId) return;

    setSelectedRoute(null);
    isUpdatingUrl.current = true;
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("route");

    const newURL = `/map${
      nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : ""
    }`;

    router.replace(newURL, { scroll: false });

    setTimeout(() => {
      isUpdatingUrl.current = false;
    }, 100);
  }, [canAccessRoutes, pathname, router, searchParams]);

  // Update state when URL changes
  useEffect(() => {
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
        isWithinBounds(location.longitude, location.latitude),
      ),
    [initialData.mapInfo, isWithinBounds],
  );

  const filteredRoutes = useMemo(
    () =>
      initialData.routes.filter((route) =>
        route.dots.every((dot) => isWithinBounds(dot.longitude, dot.latitude)),
      ),
    [initialData.routes, isWithinBounds],
  );

  const updateURL = useCallback(
    (params: { place?: string; route?: string }) => {
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

        router.replace(newURL, { scroll: false });
      } finally {
        setTimeout(() => {
          isUpdatingUrl.current = false;
        }, 100);
      }
    },
    [router],
  );

  const handleLocationSelect = useCallback(
    (locationId: string) => {
      if (locationId === selectedLocation) return;

      if (pathname !== "/map") return;

      setSelectedLocation(locationId || null);
      if (locationId) setSelectedRoute(null);

      if (locationId) {
        updateURL({ place: locationId });
      } else {
        updateURL({});
      }
    },
    [updateURL, selectedLocation, setSelectedRoute, pathname],
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      if (routeId === selectedRoute) return;

      if (pathname !== "/map") return;

      setSelectedRoute(routeId || null);
      if (routeId) setSelectedLocation(null);

      if (routeId) {
        updateURL({ route: routeId });
      } else {
        updateURL({});
      }
    },
    [updateURL, selectedRoute, setSelectedLocation, pathname],
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
