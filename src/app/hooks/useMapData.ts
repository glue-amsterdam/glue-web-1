import { config } from "@/env";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

// City bounding box from environment variables
const CITY_BOUNDS: [number, number, number, number] = [
  parseFloat(config.cityBoundWest || "0"),
  parseFloat(config.cityBoundSouth || "0"),
  parseFloat(config.cityBoundEast || "0"),
  parseFloat(config.cityBoundNorth || "0"),
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
  const [mapInfo, setMapInfo] = useState<MapInfo[]>(initialData.mapInfo);
  const [routes] = useState<Route[]>(initialData.routes); // Remove setRoutes since we don't need it anymore
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const isWithinBounds = useCallback((lng: number, lat: number) => {
    return (
      lng >= CITY_BOUNDS[0] &&
      lng <= CITY_BOUNDS[2] &&
      lat >= CITY_BOUNDS[1] &&
      lat <= CITY_BOUNDS[3]
    );
  }, []);

  const filteredMapInfo = useMemo(() => {
    return mapInfo.filter((location) =>
      isWithinBounds(location.longitude, location.latitude)
    );
  }, [mapInfo, isWithinBounds]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) =>
      route.dots.every((dot) => isWithinBounds(dot.longitude, dot.latitude))
    );
  }, [routes, isWithinBounds]);

  const updateURL = useCallback(
    (params: { place?: string; route?: string }) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      if (params.place) {
        newSearchParams.set("place", params.place);
        newSearchParams.delete("route");
      } else if (params.route) {
        newSearchParams.set("route", params.route);
        newSearchParams.delete("place");
      } else {
        newSearchParams.delete("place");
        newSearchParams.delete("route");
      }

      router.push(`/map?${newSearchParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const fetchLocationData = useCallback(async (locationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mapbox/location/${locationId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch location data: ${response.status} ${response.statusText}`
        );
      }
      const data: MapInfo = await response.json();
      setMapInfo((prevMapInfo) => {
        const index = prevMapInfo.findIndex((info) => info.id === locationId);
        if (index !== -1) {
          return [
            ...prevMapInfo.slice(0, index),
            data,
            ...prevMapInfo.slice(index + 1),
          ];
        }
        return [...prevMapInfo, data];
      });
    } catch (err) {
      setError("Failed to load location data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleParticipantSelect = useCallback(
    (locationId: string) => {
      setSelectedLocation(locationId);
      setSelectedRoute(null);
      updateURL({ place: locationId });
    },
    [updateURL]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      setSelectedRoute(routeId);
      setSelectedLocation(null);
      updateURL({ route: routeId });
    },
    [updateURL]
  );

  return {
    mapInfo: filteredMapInfo,
    routes: filteredRoutes,
    error,
    isLoading,
    selectedLocation,
    selectedRoute,
    setSelectedLocation: handleParticipantSelect,
    setSelectedRoute: handleRouteSelect,
    updateURL,
    isWithinBounds,
    fetchLocationData,
  };
}
