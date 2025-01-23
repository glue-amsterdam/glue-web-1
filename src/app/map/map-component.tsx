"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
  Source,
  Layer,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  MapPinPlus,
  MapPinHouse,
  MapPinMinusInside,
} from "lucide-react";
import type { MapInfo, Route } from "@/app/hooks/useMapData";
import { config } from "@/env";

import PopUpComponent from "@/app/map/pop-up-component";
import { useLocationData } from "@/app/hooks/useLocationData";

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

interface MapComponentProps {
  mapInfo: MapInfo[];
  routes: Route[];
  selectedRoute: string | null;
  selectedLocation: string | null;
  setSelectedLocation: (locationId: string, userId: string) => void;
  setSelectedRoute: (routeId: string) => void;
  updateURL: (params: { place?: string; route?: string }) => void;
  fetchLocationData: (locationId: string) => Promise<void>;
}

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

const MapComponent: React.FC<MapComponentProps> = ({
  mapInfo,
  routes,
  selectedRoute,
  selectedLocation,
  setSelectedLocation,
  setSelectedRoute,
  updateURL,
}) => {
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const { locationData, isLoading } = useLocationData(selectedLocation);
  const mapRef = useRef<MapRef>(null);
  const lastFetchedLocationRef = useRef<string | null>(null);

  const flyToLocation = useCallback(
    (location: { longitude: number; latitude: number }) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 12,
          duration: 1000,
        });
      }
    },
    []
  );

  useEffect(() => {
    if (locationData && selectedLocation !== lastFetchedLocationRef.current) {
      setPopupInfo(locationData);
      flyToLocation(locationData);
      lastFetchedLocationRef.current = selectedLocation;
    } else if (selectedRoute) {
      const route = routes.find((r) => r.id === selectedRoute);
      if (route && route.dots.length > 0) {
        flyToLocation(route.dots[0]);
        setPopupInfo(null);
        lastFetchedLocationRef.current = null;
      }
    }
  }, [locationData, selectedLocation, selectedRoute, routes, flyToLocation]);

  const routeGeoJSON = useMemo(() => {
    if (!selectedRoute) return null;
    const route = routes.find((r) => r.id === selectedRoute);
    if (!route) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route.dots.map((dot) => [dot.longitude, dot.latitude]),
          },
        },
      ],
    };
  }, [selectedRoute, routes]);

  useEffect(() => {
    if (locationData && selectedLocation !== lastFetchedLocationRef.current) {
      flyToLocation(locationData);
      setPopupInfo(locationData);
      lastFetchedLocationRef.current = selectedLocation;
    } else if (selectedRoute) {
      const route = routes.find((r) => r.id === selectedRoute);
      if (route && route.dots.length > 0) {
        flyToLocation(route.dots[0]);
        setPopupInfo(null);
        lastFetchedLocationRef.current = null;
      }
    }
  }, [locationData, selectedLocation, selectedRoute, routes, flyToLocation]);

  const handleMarkerClick = useCallback(
    (location: MapInfo) => {
      if (lastFetchedLocationRef.current !== location.id) {
        setSelectedLocation(location.id, "");
        updateURL({ place: location.id });
        if (selectedRoute) {
          setSelectedRoute("");
        }
      }
    },
    [setSelectedLocation, updateURL, setSelectedRoute, selectedRoute]
  );

  const handlePopupClose = useCallback(() => {
    setPopupInfo(null);
  }, []);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={config.mapboxAccesToken}
      initialViewState={{
        longitude: CITY_CENTER[0],
        latitude: CITY_CENTER[1],
        zoom: 12,
        bearing: 0,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      maxBounds={CITY_BOUNDS}
      onClick={handlePopupClose}
    >
      <NavigationControl />
      {!selectedRoute && (
        <>
          {mapInfo.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="top"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(location);
              }}
            >
              <div className="relative cursor-pointer">
                <div
                  className={`size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 ${
                    location.is_hub
                      ? "bg-green-500 opacity-70 hover:opacity-100"
                      : location.is_collective
                      ? "bg-yellow-500 opacity-70 hover:opacity-100"
                      : location.is_special_program
                      ? "bg-purple-500 opacity-70 hover:opacity-100"
                      : "bg-blue-500 opacity-70 hover:opacity-100"
                  }`}
                >
                  {location.is_hub ? (
                    <MapPinHouse className="w-5 h-5 text-white" />
                  ) : location.is_collective ? (
                    <MapPinPlus className="w-5 h-5 text-white" />
                  ) : location.is_special_program ? (
                    <MapPinMinusInside className="w-5 h-5 text-white" />
                  ) : (
                    <MapPin className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            </Marker>
          ))}
        </>
      )}

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
          {routes
            .find((r) => r.id === selectedRoute)
            ?.dots.map((dot, index) => (
              <Marker
                key={dot.id}
                longitude={dot.longitude}
                latitude={dot.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedRoute(selectedRoute);
                  updateURL({ route: selectedRoute });
                }}
              >
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold cursor-pointer">
                  {index + 1}
                </div>
              </Marker>
            ))}
        </>
      )}

      {popupInfo && (
        <PopUpComponent
          handlePopupClose={handlePopupClose}
          isLoading={isLoading}
          popupInfo={popupInfo}
        />
      )}
    </Map>
  );
};

export default MapComponent;
