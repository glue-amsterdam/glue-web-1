"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Home, MapPin, User } from "lucide-react";
import { MapInfo, Route } from "@/app/hooks/useMapData";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const CITY_BOUNDS: [number, number, number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_CITY_BOUNDS_WEST || "0"),
  parseFloat(process.env.NEXT_PUBLIC_CITY_BOUNDS_SOUTH || "0"),
  parseFloat(process.env.NEXT_PUBLIC_CITY_BOUNDS_EAST || "0"),
  parseFloat(process.env.NEXT_PUBLIC_CITY_BOUNDS_NORTH || "0"),
];

const CITY_CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_CITY_CENTER_LNG || "0"),
  parseFloat(process.env.NEXT_PUBLIC_CITY_CENTER_LAT || "0"),
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

interface PopupInfo {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  is_hub: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchLocationData = useCallback(
    async (locationId: string) => {
      if (lastFetchedLocationRef.current === locationId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/mapbox/location/${locationId}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch location data: ${response.status} ${response.statusText}`
          );
        }
        const data: PopupInfo = await response.json();
        setPopupInfo(data);
        flyToLocation(data);
        lastFetchedLocationRef.current = locationId;
      } catch (error) {
        console.error("Error fetching location data:", error);
        setPopupInfo(null);
      } finally {
        setIsLoading(false);
      }
    },
    [flyToLocation]
  );

  const routeGeoJSON = useMemo(() => {
    if (!selectedRoute) return null;
    const route = routes.find((r) => r.id === selectedRoute);
    if (!route) return null;

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route.dots.map((dot) => [dot.longitude, dot.latitude]),
      },
    };
  }, [selectedRoute, routes]);

  useEffect(() => {
    if (
      selectedLocation &&
      selectedLocation !== lastFetchedLocationRef.current
    ) {
      fetchLocationData(selectedLocation);
    } else if (selectedRoute) {
      const route = routes.find((r) => r.id === selectedRoute);
      if (route && route.dots.length > 0) {
        flyToLocation(route.dots[0]);
        setPopupInfo(null);
        lastFetchedLocationRef.current = null;
      }
    }
  }, [
    selectedLocation,
    selectedRoute,
    routes,
    flyToLocation,
    fetchLocationData,
  ]);

  const handleMarkerClick = useCallback(
    (location: MapInfo) => {
      if (lastFetchedLocationRef.current !== location.id) {
        setSelectedLocation(location.id, "");
        fetchLocationData(location.id);
        updateURL({ place: location.id });
        if (selectedRoute) {
          setSelectedRoute(""); // Deselect any route when a location is selected
        }
      }
    },
    [
      setSelectedLocation,
      fetchLocationData,
      updateURL,
      setSelectedRoute,
      selectedRoute,
    ]
  );

  const handlePopupClose = useCallback(() => {
    setPopupInfo(null);
    if (selectedLocation) {
      setSelectedLocation("", "");
      lastFetchedLocationRef.current = null;
      updateURL({});
    }
  }, [setSelectedLocation, updateURL, selectedLocation]);

  const handleGoogleMapsRedirect = useCallback((address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  }, []);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: CITY_CENTER[0],
        latitude: CITY_CENTER[1],
        zoom: 12,
        bearing: 0,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
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
                  className={`w-8 h-8 rounded-full ${
                    location.is_hub ? "bg-green-500" : "bg-blue-500"
                  } flex items-center justify-center shadow-md transition-transform hover:scale-110`}
                >
                  {location.is_hub ? (
                    <Home className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
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
        <Popup
          anchor="bottom-right"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={handlePopupClose}
          closeButton={false}
          closeOnClick={false}
        >
          <div className="w-72 overflow-hidden rounded-lg shadow-md bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner />
              </div>
            ) : (
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
                className="w-full bg-[var(--color-box1)]"
                key={popupInfo.id}
              >
                <CarouselContent>
                  {popupInfo.participants.map((participant, index) => (
                    <CarouselItem key={`${participant.user_id}-${index}`}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent z-10"></div>
                        <img
                          src={
                            participant.image_url ||
                            "/participant-placeholder.jpg"
                          }
                          alt={`Image of ${participant.user_name}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/participant-placeholder.jpg";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                          <h3 className="font-semibold text-lg leading-tight text-white mb-1">
                            {participant.user_name}
                          </h3>
                          <p className="text-xs text-white/80 line-clamp-2">
                            {popupInfo.formatted_address}
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        {popupInfo.is_hub && (
                          <p className="text-sm font-medium text-emerald-600 mb-2">
                            Hub: {popupInfo.hub_name}
                            {participant.is_host && " (Host)"}
                          </p>
                        )}
                        <div className="flex space-x-2 items-center flex-wrap">
                          <Link
                            target="_blank"
                            href={`/participants/${participant.slug}`}
                            passHref
                            className="flex-1"
                          >
                            <Button
                              type="button"
                              variant="default"
                              className="w-full bg-[var(--color-triangle)] hover:bg-orange-600 text-white transition-colors duration-200"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="flex-1 bg-white text-[var(--color-triangle)] border-[var(--color-triangle)] hover:bg-orange-600 hover:text-white transition-colors duration-200"
                            onClick={() =>
                              handleGoogleMapsRedirect(
                                popupInfo.formatted_address
                              )
                            }
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Map
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
};

export default MapComponent;
