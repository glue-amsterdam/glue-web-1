"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
  Source,
  Layer,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapInfo, Route as RouteType } from "@/app/hooks/useMapData";
import { config } from "@/env";
import { useLocationData } from "@/app/hooks/useLocationData";
import { MemoizedMarker } from "@/app/map/memorized-marker";
import MemoizedPopUpComponent from "@/app/map/pop-up-component";
import { useDebouncedCallback } from "use-debounce";
import MemoizedRoutePopupComponent from "@/app/map/route-pop-up";

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
  routes: RouteType[];
  selectedLocation: string | null;
  selectedRoute: string | null;
  setSelectedLocation: (locationId: string) => void;
  setSelectedRoute: (routeId: string) => void;
  onParticipantSelect: (locationId: string) => void;
  onRouteSelect: (routeId: string) => void;
  updateURL: (params: { place?: string; route?: string }) => void;
  className?: string;
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
  const [showRoutePopup, setShowRoutePopup] = useState<boolean>(false);
  const { locationData, isLoading, isError } =
    useLocationData(selectedLocation);
  const mapRef = useRef<MapRef>(null);
  const lastFetchedLocationRef = useRef<string | null>(null);

  // Debounced fly-to function
  const debouncedFlyToLocation = useDebouncedCallback(
    (location: { longitude: number; latitude: number }) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 12,
          duration: 1000,
        });
      }
    },
    150 // Debounce delay
  );

  // Update popup and fly to location when locationData changes
  useEffect(() => {
    if (locationData && selectedLocation !== lastFetchedLocationRef.current) {
      setPopupInfo(locationData);
      setShowRoutePopup(false);
      debouncedFlyToLocation(locationData);
      lastFetchedLocationRef.current = selectedLocation;
    } else if (selectedRoute) {
      const route = routes.find((r) => r.id === selectedRoute);
      if (route && route.dots.length > 0) {
        debouncedFlyToLocation(route.dots[0]);
        setPopupInfo(null);
        setShowRoutePopup(true);
        lastFetchedLocationRef.current = null;
      }
    }
  }, [
    locationData,
    selectedLocation,
    selectedRoute,
    routes,
    debouncedFlyToLocation,
  ]);

  // Memoized GeoJSON for the selected route
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

  // Get the selected route object
  const selectedRouteObject = useMemo(() => {
    if (!selectedRoute) return null;
    return routes.find((r) => r.id === selectedRoute) || null;
  }, [selectedRoute, routes]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (location: MapInfo) => {
      if (lastFetchedLocationRef.current !== location.id) {
        updateURL({ place: location.id });
        setSelectedLocation(location.id);
        if (selectedRoute) {
          setSelectedRoute("");
          setShowRoutePopup(false);
        }
      }
    },
    [setSelectedLocation, updateURL, setSelectedRoute, selectedRoute]
  );

  // Handle route marker click
  const handleRouteMarkerClick = useCallback(
    (e: React.MouseEvent, routeId: string) => {
      setShowRoutePopup(true);
      setSelectedRoute(routeId);
      updateURL({ route: routeId });
    },
    [setSelectedRoute, updateURL]
  );

  // Handle popup close
  const handlePopupClose = useCallback(() => {
    setPopupInfo(null);
    setShowRoutePopup(false);
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
      {!selectedRoute &&
        mapInfo.map((location) => (
          <MemoizedMarker
            key={location.id}
            location={location}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(location);
            }}
          />
        ))}
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
                  handleRouteMarkerClick(
                    e as unknown as React.MouseEvent,
                    selectedRoute
                  );
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
        <MemoizedPopUpComponent
          handlePopupClose={handlePopupClose}
          isLoading={isLoading}
          popupInfo={popupInfo}
          isError={isError}
        />
      )}
      {showRoutePopup && selectedRouteObject && (
        <MemoizedRoutePopupComponent
          route={selectedRouteObject}
          handlePopupClose={handlePopupClose}
        />
      )}
    </Map>
  );
};

const MemoizedMapComponent = memo(MapComponent);

export default MemoizedMapComponent;
