"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  User,
  Home,
  Route,
  ChevronRight,
  ExternalLink,
  Lock,
  LockOpen,
} from "lucide-react";
import { MapInfo, Route as RouteType, RouteZone } from "@/app/hooks/useMapData";
import { useAuth } from "@/app/context/AuthContext";
import LoginForm from "@/app/components/login-form/login-form";
import { useRouter } from "next/navigation";

interface InfoPanelProps {
  mapInfo: MapInfo[];
  routes: RouteType[];
  selectedLocation: string | null;
  selectedRoute: string | null;
  onParticipantSelect: (locationId: string) => void;
  onRouteSelect: (routeId: string) => void;
  updateURL: (params: { place?: string; route?: string }) => void;
  className?: string;
}

export function InfoPanel({
  mapInfo,
  routes,
  selectedLocation,
  selectedRoute,
  onParticipantSelect,
  onRouteSelect,
  className,
}: InfoPanelProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLoginModalOpen = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const [openAccordions, setOpenAccordions] = useState<string[]>([
    "participants",
  ]);
  const [openRoutes, setOpenRoutes] = useState<string[]>([]);

  const groupedRoutes = useMemo(() => {
    return routes.reduce((acc, route) => {
      if (!acc[route.zone]) {
        acc[route.zone] = [];
      }
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

  const toggleRoute = useCallback((routeId: string) => {
    setOpenRoutes((current) => {
      const set = new Set(current);
      if (set.has(routeId)) set.delete(routeId);
      else set.add(routeId);
      return Array.from(set);
    });
  }, []);

  const redirectToGoogleMaps = useCallback((lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  }, []);

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    router.refresh();
  };

  const redirectRouteToGoogleMaps = useCallback((route: RouteType) => {
    const waypoints = route.dots
      .map((dot) => `${dot.latitude},${dot.longitude}`)
      .join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${
      route.dots[0].latitude
    },${route.dots[0].longitude}&destination=${
      route.dots[route.dots.length - 1].latitude
    },${route.dots[route.dots.length - 1].longitude}&waypoints=${waypoints}`;
    window.open(url, "_blank");
  }, []);

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
            <AccordionTrigger className="text-lg font-semibold">
              <Users className="mr-2 h-5 w-5" />
              Participants
            </AccordionTrigger>
            <AccordionContent>
              {mapInfo.length === 0 ? (
                <p>No participants found within the specified area.</p>
              ) : (
                <div className="space-y-2">
                  {mapInfo.map((location) => (
                    <div key={location.id} className="space-y-1">
                      {location.is_hub ? (
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            className={`w-full justify-start ${
                              selectedLocation === location.id
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                            onClick={() => onParticipantSelect(location.id)}
                          >
                            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                            <span>{location.hub_name}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              redirectToGoogleMaps(
                                location.latitude,
                                location.longitude
                              )
                            }
                            className="ml-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        location.participants.map((participant) => (
                          <div
                            key={participant.user_id}
                            className="flex items-center"
                          >
                            <Button
                              variant={
                                selectedLocation === location.id
                                  ? "secondary"
                                  : "ghost"
                              }
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => onParticipantSelect(location.id)}
                            >
                              <User
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                              />
                              <span>{participant.user_name}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                redirectToGoogleMaps(
                                  location.latitude,
                                  location.longitude
                                )
                              }
                              className="ml-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
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
                <AccordionTrigger
                  onClick={handleLoginModalOpen}
                  className="text-lg font-semibold"
                >
                  <Route className="mr-2 h-5 w-5" />
                  {zone} Routes
                  {!user ? (
                    <Lock className="ml-2 h-4 w-4 text-red-600" />
                  ) : (
                    <LockOpen className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  {user ? (
                    <div className="space-y-2">
                      {zoneRoutes.map((route) => (
                        <div key={route.id}>
                          <div className="flex items-center mb-2">
                            <Button
                              variant={
                                selectedRoute === route.id
                                  ? "secondary"
                                  : "ghost"
                              }
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                onRouteSelect(route.id);
                                toggleRoute(route.id);
                              }}
                            >
                              <MapPin
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                              />
                              <span>{route.name}</span>
                              <ChevronRight
                                className={`ml-auto h-4 w-4 transition-transform ${
                                  openRoutes.includes(route.id)
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => redirectRouteToGoogleMaps(route)}
                              className="ml-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          {openRoutes.includes(route.id) && (
                            <div className="pl-4 space-y-2">
                              {route.dots.map((dot, index) => (
                                <div
                                  key={dot.id}
                                  className="flex items-center text-sm"
                                >
                                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                    {index + 1}
                                  </span>
                                  <span>
                                    {dot.formatted_address ||
                                      "Unknown Location"}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      redirectToGoogleMaps(
                                        dot.latitude,
                                        dot.longitude
                                      )
                                    }
                                    className="ml-auto"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Please log in to view routes
                      </p>
                    </div>
                  )}
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
