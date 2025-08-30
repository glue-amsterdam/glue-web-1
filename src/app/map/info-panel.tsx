"use client";

import React, { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  MapPinIcon,
  RouteIcon,
  ExternalLink,
  Users,
  User,
} from "lucide-react";
import { type MapInfo, type Route as RouteType } from "@/app/hooks/useMapData";

interface InfoPanelProps {
  mapInfo: MapInfo[];
  routes: RouteType[];
  selectedLocation: string | null;
  selectedRoute: string | null;
  onLocationSelect: (locationId: string) => void;
  onRouteSelect: (routeId: string) => void;
  className?: string;
}

function InfoPanel({
  mapInfo,
  routes,
  selectedLocation,
  selectedRoute,
  onLocationSelect,
  onRouteSelect,
  className,
}: InfoPanelProps) {
  // Start with no accordions open by default
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const redirectToGoogleMaps = useCallback(
    (lat: number, lng: number, e: React.MouseEvent) => {
      e.stopPropagation(); // Importante: evitar que el evento se propague
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank"
      );
    },
    []
  );

  const redirectRouteToGoogleMaps = useCallback(
    (route: RouteType, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!route || route.dots.length === 0) return;

      const origin = `${route.dots[0].latitude},${route.dots[0].longitude}`;
      const destination = `${route.dots[route.dots.length - 1].latitude},${
        route.dots[route.dots.length - 1].longitude
      }`;

      const waypoints = route.dots
        .slice(1, -1)
        .map((dot) => `${dot.latitude},${dot.longitude}`)
        .join("|");

      let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

      if (waypoints) {
        url += `&waypoints=${waypoints}`;
      }

      window.open(url, "_blank");
    },
    []
  );

  // Custom handler for accordion value change
  const handleAccordionChange = (value: string[]) => {
    setOpenAccordions(value);
  };

  const handleLocationClick = useCallback(
    (locationId: string) => {
      onLocationSelect(locationId);
    },
    [onLocationSelect]
  );

  const handleRouteClick = useCallback(
    (routeId: string) => {
      onRouteSelect(routeId);
    },
    [onRouteSelect]
  );

  return (
    <ScrollArea className={`h-[calc(100vh-5rem)] ${className} text-black`}>
      <div className="p-4 space-y-4">
        <Accordion
          type="multiple"
          value={openAccordions}
          onValueChange={handleAccordionChange}
          className="w-full"
        >
          <AccordionItem value="participants">
            <AccordionTrigger className="text-base font-semibold hover:bg-gray-100 rounded-lg px-2 py-1">
              <Users className="mr-2 h-4 w-4" />
              PARTICIPANTS
            </AccordionTrigger>
            <AccordionContent>
              {mapInfo.length === 0 ? (
                <p>No participants found within the specified area.</p>
              ) : (
                <div className="space-y-2">
                  {mapInfo.map((location) => (
                    <LocationItem
                      key={location.id}
                      location={location}
                      selectedLocation={selectedLocation}
                      onSelect={handleLocationClick}
                      redirectToGoogleMaps={redirectToGoogleMaps}
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          {routes.length > 0 && (
            <AccordionItem value="routes">
              <AccordionTrigger className="text-base font-semibold hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer">
                <RouteIcon className="mr-2 h-4 w-4" />
                ROUTES
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {routes.map((route) => (
                    <RouteItem
                      key={route.id}
                      route={route}
                      selectedRoute={selectedRoute}
                      onSelect={handleRouteClick}
                      redirectRouteToGoogleMaps={redirectRouteToGoogleMaps}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </ScrollArea>
  );
}

const LocationItem = React.memo(
  ({
    location,
    selectedLocation,
    onSelect,
    redirectToGoogleMaps,
  }: {
    location: MapInfo;
    selectedLocation: string | null;
    onSelect: (locationId: string) => void;
    redirectToGoogleMaps: (
      lat: number,
      lng: number,
      e: React.MouseEvent
    ) => void;
  }) => {
    const handleClick = useCallback(() => {
      onSelect(location.id);
    }, [onSelect, location.id]);

    return (
      <div className="border rounded-lg overflow-hidden mb-2">
        {location.is_hub || location.is_collective ? (
          <Accordion
            type="single"
            value={selectedLocation === location.id ? location.id : ""}
            onValueChange={(value) => value && onSelect(value)}
          >
            <AccordionItem value={location.id}>
              <AccordionTrigger
                className={`p-2 text-sm hover:bg-gray/50 ${
                  selectedLocation === location.id
                    ? location.is_hub
                      ? "bg-green-500/50"
                      : "bg-yellow-500/50"
                    : ""
                }`}
                onClick={handleClick}
              >
                <div className="flex items-center w-full">
                  {location.is_hub ? (
                    <MapPinIcon
                      className="mr-2 h-4 w-4 text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <MapPinIcon
                      className="mr-2 h-4 w-4 text-yellow-500"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex-grow flex text-left text-sm gap-2">
                    <span>{location.hub_name}</span>
                  </div>
                  <div
                    onClick={(e) =>
                      redirectToGoogleMaps(
                        location.latitude,
                        location.longitude,
                        e
                      )
                    }
                    className="ml-2 cursor-pointer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 space-y-1">
                  {location.participants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center py-1 text-xs"
                    >
                      <span>{participant.user_name}</span>
                      {participant.is_host && (
                        <span className="ml-2 text-xs bg-black/50 text-white px-1 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div
            className={`p-2 text-sm hover:bg-gray/50 cursor-pointer ${
              selectedLocation === location.id
                ? location.is_special_program
                  ? "bg-purple-500/50"
                  : "bg-blue-500/50"
                : ""
            }`}
            onClick={handleClick}
          >
            <div className="flex items-center w-full">
              {location.is_special_program ? (
                <MapPinIcon
                  className="mr-2 h-4 w-4 text-purple-500"
                  aria-hidden="true"
                />
              ) : (
                <MapPin
                  className="mr-2 h-4 w-4 text-blue-500"
                  aria-hidden="true"
                />
              )}
              <span className="flex-grow text-left text-sm">
                {location.is_special_program
                  ? `${location.participants[0].user_name}`
                  : `${location.participants[0].user_name}`}
              </span>
              <div
                onClick={(e) =>
                  redirectToGoogleMaps(location.latitude, location.longitude, e)
                }
                className="ml-2 cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
LocationItem.displayName = "LocationItem";

const RouteItem = React.memo(
  ({
    route,
    selectedRoute,
    onSelect,
    redirectRouteToGoogleMaps,
  }: {
    route: RouteType;
    selectedRoute: string | null;
    onSelect: (routeId: string) => void;
    redirectRouteToGoogleMaps: (route: RouteType, e: React.MouseEvent) => void;
  }) => {
    const handleClick = useCallback(() => {
      onSelect(route.id);
    }, [onSelect, route.id]);
    return (
      <Accordion
        type="single"
        collapsible
        value={selectedRoute === route.id ? route.id : ""}
        onValueChange={(value) => value && onSelect(value)}
        className="border rounded-lg overflow-hidden mb-2"
      >
        <AccordionItem value={route.id}>
          <AccordionTrigger
            className={`p-2 text-sm hover:bg-gray/50 ${
              selectedRoute === route.id ? "bg-red-500/10" : ""
            }`}
            onClick={handleClick}
          >
            <div className="flex items-center w-full">
              <RouteIcon
                className="mr-2 h-4 w-4 text-red-500"
                aria-hidden="true"
              />
              <span className="flex-grow text-left text-sm">{route.name}</span>
              <div
                onClick={(e) => redirectRouteToGoogleMaps(route, e)}
                className="ml-2 cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-4 space-y-1">
              {route.dots.map((dot, index) => (
                <div
                  key={dot.id}
                  className="flex items-center text-xs py-1 hover:bg-gray-50"
                >
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 text-[10px]">
                    {index + 1}
                  </span>
                  <div className="">
                    <div className="flex gap-2">
                      <User className="size-3" />
                      {dot.user_name}
                    </div>
                    <div className="text-gray-500">{dot.formatted_address}</div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
);
RouteItem.displayName = "RouteItem";

export default React.memo(InfoPanel);
