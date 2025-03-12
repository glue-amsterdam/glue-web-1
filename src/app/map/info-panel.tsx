"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  MapPinIcon as MapPinPlus,
  MapPinIcon as MapPinHouse,
  MapPinIcon as MapPinMinusInside,
  Route,
  ExternalLink,
  RouteIcon,
  Users,
  User,
} from "lucide-react";
import {
  type MapInfo,
  type Route as RouteType,
  RouteZone,
} from "@/app/hooks/useMapData";
import LoginForm from "@/app/components/login-form/login-form";
import { useRouter } from "next/navigation";

interface InfoPanelProps {
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

function InfoPanel({
  mapInfo,
  routes,
  selectedLocation,
  selectedRoute,
  setSelectedLocation,
  setSelectedRoute,
  onParticipantSelect,
  onRouteSelect,
  updateURL,
  className,
}: InfoPanelProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openAccordions, setOpenAccordions] = useState<string[]>([
    "participants",
  ]);

  useEffect(() => {
    const placeId = searchParams.get("place");
    const routeId = searchParams.get("route");

    if (placeId) {
      setOpenAccordions((prev) =>
        prev.includes("participants") ? prev : [...prev, "participants"]
      );
      setSelectedLocation(placeId);
    } else {
      setOpenAccordions((prev) =>
        prev.filter((item) => item !== "participants")
      );
    }

    if (routeId) {
      const routeZone = routeId.split("-")[0];
      setOpenAccordions((prev) =>
        prev.includes(routeZone) ? prev : [...prev, routeZone]
      );
      setSelectedRoute(routeId);
    }
  }, [searchParams, setSelectedLocation, setSelectedRoute]);

  const groupedRoutes = useMemo(() => {
    return routes.reduce((acc, route) => {
      if (!acc[route.zone]) acc[route.zone] = [];
      acc[route.zone].push(route);
      return acc;
    }, {} as Record<RouteZone, RouteType[]>);
  }, [routes]);

  const zoneOrder: RouteZone[] = [
    RouteZone.NORTH,
    RouteZone.SOUTH,
    RouteZone.EAST,
    RouteZone.WEST,
  ];

  const redirectToGoogleMaps = useCallback((lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  }, []);

  const redirectRouteToGoogleMaps = useCallback((route: RouteType) => {
    if (!route || route.dots.length === 0) return;

    const origin = `${route.dots[0].latitude},${route.dots[0].longitude}`;
    const destination = `${route.dots[route.dots.length - 1].latitude},${
      route.dots[route.dots.length - 1].longitude
    }`;

    const waypoints = route.dots
      .slice(1, -1) // Remove first and last dots to avoid duplication
      .map((dot) => `${dot.latitude},${dot.longitude}`)
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    window.open(url, "_blank");
  }, []);

  const handleLocationSelect = useCallback(
    (locationId: string) => {
      updateURL({ place: locationId, route: undefined });
      onParticipantSelect(locationId);
      setOpenAccordions((prev) => {
        const newAccordions = prev.filter(
          (item) => item === "participants" || item === locationId
        );
        return newAccordions.includes("participants")
          ? newAccordions
          : ["participants", ...newAccordions];
      });
    },
    [onParticipantSelect, updateURL]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      updateURL({ place: undefined, route: routeId });
      onRouteSelect(routeId);
      setOpenAccordions((prev) => {
        const newAccordions = prev.filter((item) => item !== "participants");
        return [...newAccordions, routeId.split("-")[0]];
      });
    },
    [onRouteSelect, updateURL]
  );

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    router.refresh();
  };

  return (
    <ScrollArea className={`h-[calc(100vh-5rem)] ${className} text-black`}>
      <div className="p-4 space-y-4">
        <Accordion
          type="multiple"
          value={openAccordions}
          onValueChange={setOpenAccordions}
          className="w-full"
        >
          <AccordionItem value="participants">
            <AccordionTrigger className="text-base font-semibold hover:bg-gray-100 rounded-lg px-2 py-1">
              <Users className="mr-2 h-4 w-4" />
              Participants
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
                      onSelect={handleLocationSelect}
                      redirectToGoogleMaps={redirectToGoogleMaps}
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          {zoneOrder.map((zone) => {
            const zoneRoutes = groupedRoutes[zone] || [];
            if (zoneRoutes.length === 0) return null;

            return (
              <AccordionItem key={zone} value={zone}>
                <AccordionTrigger className="text-base font-semibold hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer">
                  <Route className="mr-2 h-4 w-4" />
                  {zone} Routes
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {zoneRoutes.map((route) => (
                      <RouteItem
                        key={route.id}
                        route={route}
                        selectedRoute={selectedRoute}
                        onSelect={handleRouteSelect}
                        redirectRouteToGoogleMaps={redirectRouteToGoogleMaps}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
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
    redirectToGoogleMaps: (lat: number, lng: number) => void;
  }) => {
    return (
      <div className="border rounded-lg overflow-hidden mb-2">
        {location.is_hub || location.is_collective ? (
          <Accordion
            type="single"
            value={selectedLocation || ""}
            onValueChange={onSelect}
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
                onClick={() => onSelect(location.id)}
              >
                <div className="flex items-center w-full">
                  {location.is_hub ? (
                    <MapPinHouse
                      className="mr-2 h-4 w-4 text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <MapPinPlus
                      className="mr-2 h-4 w-4 text-yellow-500"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex-grow flex text-left text-sm gap-2">
                    <span>{location.hub_name}</span>-
                    <span>{location.is_hub ? "HUB" : "Collective"}</span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      redirectToGoogleMaps(
                        location.latitude,
                        location.longitude
                      );
                    }}
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
            onClick={() => onSelect(location.id)}
          >
            <div className="flex items-center w-full">
              {location.is_special_program ? (
                <MapPinMinusInside
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
                  ? `${location.participants[0].user_name} - Special Program`
                  : `${location.participants[0].user_name} - Participant`}
              </span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  redirectToGoogleMaps(location.latitude, location.longitude);
                }}
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
    redirectRouteToGoogleMaps: (route: RouteType) => void;
  }) => {
    return (
      <Accordion
        type="single"
        collapsible
        value={selectedRoute || ""}
        onValueChange={onSelect}
        className="border rounded-lg overflow-hidden mb-2"
      >
        <AccordionItem value={route.id}>
          <AccordionTrigger
            className={`p-2 text-sm hover:bg-gray/50 ${
              selectedRoute === route.id ? "bg-red-500/10" : ""
            }`}
            onClick={() => onSelect(route.id)}
          >
            <div className="flex items-center w-full">
              <RouteIcon
                className="mr-2 h-4 w-4 text-red-500"
                aria-hidden="true"
              />
              <span className="flex-grow text-left text-sm">{route.name}</span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  redirectRouteToGoogleMaps(route);
                }}
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

const Memoinfo = React.memo(InfoPanel);

export default Memoinfo;
