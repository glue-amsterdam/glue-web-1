"use client";

import React, { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
  User,
  ArrowLeft,
  Search,
} from "lucide-react";
import { type MapInfo, type Route as RouteType } from "@/app/hooks/useMapData";
import { legendItems, markerColors } from "./legend-config";

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
  // State for managing the current view
  const [currentView, setCurrentView] = useState<
    "headers" | "participants" | "routes" | "legend"
  >("headers");

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    participants: MapInfo[];
    routes: RouteType[];
  }>({ participants: [], routes: [] });

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

  // Handler for accordion header clicks
  const handleAccordionClick = useCallback(
    (view: "participants" | "routes" | "legend") => {
      setCurrentView(view);
    },
    []
  );

  // Handler for back button
  const handleBackClick = useCallback(() => {
    setCurrentView("headers");
  }, []);

  // Search logic
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (query.trim() === "") {
        setSearchResults({ participants: [], routes: [] });
        return;
      }

      const lowerQuery = query.toLowerCase();

      // Search in participants/hubs
      const filteredParticipants = mapInfo.filter((location) => {
        // Search in hub name
        if (location.hub_name?.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in participant names
        return location.participants.some((participant) =>
          participant.user_name.toLowerCase().includes(lowerQuery)
        );
      });

      // Search in routes
      const filteredRoutes = routes.filter((route) =>
        route.name.toLowerCase().includes(lowerQuery)
      );

      setSearchResults({
        participants: filteredParticipants,
        routes: filteredRoutes,
      });
    },
    [mapInfo, routes]
  );

  // Handle search result click
  const handleSearchResultClick = useCallback(
    (type: "participant" | "route", id: string) => {
      if (type === "participant") {
        onLocationSelect(id);
      } else {
        onRouteSelect(id);
      }
      setSearchQuery("");
      setSearchResults({ participants: [], routes: [] });
    },
    [onLocationSelect, onRouteSelect]
  );

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
    <div
      className={`${className} text-black bg-white md:bg-transparent h-full relative flex flex-col`}
    >
      {/* Search Bar - Always visible */}
      <div className="relative pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in map..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Results - Absolutely positioned */}
        {searchQuery.trim() !== "" &&
          (searchResults.participants.length > 0 ||
            searchResults.routes.length > 0) && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg">
              {searchResults.participants.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 mb-1 px-3 pt-2">
                    PARTICIPANTS & HUBS
                  </h4>
                  {searchResults.participants.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 bg-white"
                      onClick={() =>
                        handleSearchResultClick("participant", location.id)
                      }
                    >
                      {location.is_hub ||
                      (location.is_collective &&
                        location.participants.length >= 3) ? (
                        <MapPinIcon className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm text-black">
                        {(location.display_number ||
                          location.hub_display_number) &&
                          `${
                            location.display_number ||
                            location.hub_display_number
                          } - `}
                        {location.hub_name ||
                          location.participants[0]?.user_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.routes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-1 px-3 pt-2">
                    ROUTES
                  </h4>
                  {searchResults.routes.map((route) => (
                    <div
                      key={route.id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 bg-white"
                      onClick={() => handleSearchResultClick("route", route.id)}
                    >
                      <RouteIcon className="mr-2 h-4 w-4 text-red-500" />
                      <span className="text-sm text-black">{route.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

      {currentView === "headers" ? (
        // Accordion headers view with transparent background and justify-between
        <div className="flex-1 flex flex-col md:justify-evenly p-4 animate-in fade-in-0 slide-in-from-left-4 duration-300 min-h-0">
          {/* Top section - PARTICIPANTS */}
          <Button
            variant="ghost"
            className="w-full justify-start text-xl md:text-3xl lg:text-4xl font-semibold hover:bg-gray-100 px-4 py-3 h-auto tracking-widest transition-all duration-200 hover:scale-105 hover:shadow-lg text-black md:text-white"
            onClick={() => handleAccordionClick("participants")}
          >
            participants
          </Button>

          {/* Middle section - ROUTES (if available) */}
          {routes.length > 0 ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-xl md:text-3xl lg:text-4xl font-semibold hover:bg-gray-100 px-4 py-3 h-auto tracking-widest transition-all duration-200 hover:scale-105 hover:shadow-lg text-black md:text-white"
              onClick={() => handleAccordionClick("routes")}
            >
              routes
            </Button>
          ) : (
            <div></div>
          )}

          {/* Bottom section - LEGEND */}
          <Button
            variant="ghost"
            className="w-full justify-start text-xl md:text-3xl lg:text-4xl font-semibold hover:bg-gray-100 px-4 py-3 h-auto tracking-widest transition-all duration-200 hover:scale-105 hover:shadow-lg text-black md:text-white"
            onClick={() => handleAccordionClick("legend")}
          >
            legend
          </Button>
        </div>
      ) : (
        // Content view with back button and list
        <div className="flex-1 flex flex-col animate-in fade-in-0 slide-in-from-right-4 duration-300 min-h-0">
          {/* Back button header */}
          <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="mr-3 transition-all duration-200 hover:scale-105 hover:bg-gray-100 text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-lg font-semibold text-black">
              {currentView === "participants" && "PARTICIPANTS"}
              {currentView === "routes" && "ROUTES"}
              {currentView === "legend" && "LEGEND"}
            </h2>
          </div>

          {/* Content area */}
          <ScrollArea className="flex-1 bg-white min-h-0">
            <div className="p-4 space-y-2 bg-white">
              {currentView === "participants" && (
                <>
                  {mapInfo.length === 0 ? (
                    <p className="text-black">
                      No participants found within the specified area.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {mapInfo.map((location, index) => (
                        <div
                          key={location.id}
                          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <LocationItem
                            location={location}
                            selectedLocation={selectedLocation}
                            onSelect={handleLocationClick}
                            redirectToGoogleMaps={redirectToGoogleMaps}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {currentView === "routes" && (
                <div className="space-y-2">
                  {routes.map((route, index) => (
                    <div
                      key={route.id}
                      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <RouteItem
                        route={route}
                        selectedRoute={selectedRoute}
                        onSelect={handleRouteClick}
                        redirectRouteToGoogleMaps={redirectRouteToGoogleMaps}
                        mapInfo={mapInfo}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentView === "legend" && (
                <div className="space-y-3">
                  {legendItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 bg-white p-3 border"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`size-6 flex items-center justify-center flex-shrink-0 ${item.color} opacity-70 transition-all duration-200 hover:opacity-100 hover:scale-110`}
                      >
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-black">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
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

    // Determine if this should be shown as a HUB (3+ participants) or Participant (<3 participants)
    // According to legend: GLUE HUB = 3 or more participants, Up to 3 GLUE participants = participant
    // But also respect the is_hub flag from the database
    const isHub =
      location.is_hub ||
      (location.participants && location.participants.length >= 3);

    return (
      <div className="border overflow-hidden mb-2 bg-white">
        {isHub ? (
          <Accordion
            type="single"
            value={selectedLocation === location.id ? location.id : ""}
            onValueChange={(value) => value && onSelect(value)}
          >
            <AccordionItem value={location.id}>
              <AccordionTrigger
                className={`p-2 text-sm hover:bg-gray-100 text-black ${
                  selectedLocation === location.id
                    ? markerColors.hub.backgroundLight
                    : ""
                }`}
                onClick={handleClick}
              >
                <div className="flex items-center w-full">
                  {location.hub_display_number || location.display_number ? (
                    <div
                      className={`mr-2 w-5 h-5 rounded-full ${markerColors.hub.background} flex items-center justify-center`}
                    >
                      <span
                        className={`text-xs font-bold ${markerColors.hub.text}`}
                      >
                        {location.hub_display_number || location.display_number}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`mr-2 w-5 h-5 rounded-full ${markerColors.hub.background} flex items-center justify-center`}
                    >
                      <MapPinIcon
                        className={`h-3 w-3 ${markerColors.hub.text}`}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex-grow flex text-left text-sm gap-2 text-black">
                    <span>
                      {location.hub_name || location.participants[0]?.user_name}
                    </span>
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
                      className="flex items-center py-1 text-xs text-black"
                    >
                      <span className="flex-grow">{participant.user_name}</span>
                      {participant.display_number && (
                        <div
                          className={`ml-2 w-5 h-5 rounded-full ${markerColors.hub.background} flex items-center justify-center`}
                        >
                          <span
                            className={`text-xs font-bold ${markerColors.hub.text}`}
                          >
                            {participant.display_number}
                          </span>
                        </div>
                      )}
                      {participant.is_host && (
                        <span className="ml-2 text-xs bg-black/50 text-white px-1 py-0.5">
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
            className={`p-2 text-sm hover:bg-gray-100 cursor-pointer text-black ${
              selectedLocation === location.id
                ? isHub
                  ? markerColors.hub.backgroundLight
                  : location.is_special_program
                  ? markerColors.specialProgram.backgroundLight
                  : markerColors.participant.backgroundLight
                : ""
            }`}
            onClick={handleClick}
          >
            <div className="flex items-center w-full">
              {!!(
                location.hub_display_number ||
                location.display_number ||
                location.participants[0]?.display_number
              ) ? (
                <div
                  className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center ${
                    isHub
                      ? markerColors.hub.background
                      : location.is_special_program
                      ? markerColors.specialProgram.background
                      : markerColors.participant.background
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isHub || location.is_special_program
                        ? markerColors.hub.text
                        : markerColors.participant.text
                    }`}
                  >
                    {location.hub_display_number ||
                      location.display_number ||
                      location.participants[0]?.display_number}
                  </span>
                </div>
              ) : (
                <div
                  className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center ${
                    isHub
                      ? markerColors.hub.background
                      : location.is_special_program
                      ? markerColors.specialProgram.background
                      : markerColors.participant.background
                  }`}
                >
                  {isHub ? (
                    <MapPinIcon
                      className={`h-3 w-3 ${markerColors.hub.text}`}
                      aria-hidden="true"
                    />
                  ) : location.is_special_program ? (
                    <MapPinIcon
                      className={`h-3 w-3 ${markerColors.specialProgram.text}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <MapPin
                      className={`h-3 w-3 ${markerColors.participant.text}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}
              <div className="flex-grow text-left text-sm text-black flex items-center">
                <span>{location.participants[0].user_name}</span>
              </div>
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
    mapInfo,
  }: {
    route: RouteType;
    selectedRoute: string | null;
    onSelect: (routeId: string) => void;
    redirectRouteToGoogleMaps: (route: RouteType, e: React.MouseEvent) => void;
    mapInfo: MapInfo[];
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
        className="border overflow-hidden mb-2 bg-white"
      >
        <AccordionItem value={route.id}>
          <AccordionTrigger
            className={`p-2 text-sm hover:bg-gray-100 text-black ${
              selectedRoute === route.id ? "bg-red-100" : ""
            }`}
            onClick={handleClick}
          >
            <div className="flex items-center w-full">
              <RouteIcon
                className="mr-2 h-4 w-4 text-red-500"
                aria-hidden="true"
              />
              <span className="flex-grow text-left text-sm text-black">
                {route.name}
              </span>
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
              {route.dots
                .sort((a, b) => a.route_step - b.route_step)
                .map((dot) => {
                  // Find the corresponding location in mapInfo
                  const location = mapInfo.find((loc) =>
                    loc.participants.some((p) => p.user_name === dot.user_name)
                  );

                  // Determine if this is a hub
                  const isHub = location
                    ? location.is_hub ||
                      (location.participants &&
                        location.participants.length >= 3)
                    : false;

                  // Get display number
                  const displayNumber = location
                    ? location.hub_display_number ||
                      location.display_number ||
                      location.participants[0]?.display_number
                    : null;

                  const hasDisplayNumber = !!displayNumber;

                  return (
                    <div
                      key={dot.id}
                      className="flex items-center text-xs py-1 hover:bg-gray-50 text-black"
                    >
                      {/* Route step number */}
                      <span className="w-4 h-4 bg-red-500 text-white flex items-center justify-center mr-2 text-[10px] font-bold">
                        {dot.route_step}
                      </span>

                      {/* Participant display number or icon */}
                      {hasDisplayNumber ? (
                        <div
                          className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center ${
                            isHub
                              ? markerColors.hub.background
                              : location?.is_special_program
                              ? markerColors.specialProgram.background
                              : markerColors.participant.background
                          }`}
                        >
                          <span
                            className={`text-xs font-bold ${
                              isHub || location?.is_special_program
                                ? markerColors.hub.text
                                : markerColors.participant.text
                            }`}
                          >
                            {displayNumber}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center ${
                            isHub
                              ? markerColors.hub.background
                              : location?.is_special_program
                              ? markerColors.specialProgram.background
                              : markerColors.participant.background
                          }`}
                        >
                          {isHub ? (
                            <MapPinIcon
                              className={`h-3 w-3 ${markerColors.hub.text}`}
                              aria-hidden="true"
                            />
                          ) : location?.is_special_program ? (
                            <MapPinIcon
                              className={`h-3 w-3 ${markerColors.specialProgram.text}`}
                              aria-hidden="true"
                            />
                          ) : (
                            <MapPin
                              className={`h-3 w-3 ${markerColors.participant.text}`}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      )}

                      {/* Participant info */}
                      <div className="flex-grow">
                        <div className="flex gap-2 text-black">
                          <User className="size-3" />
                          {dot.user_name}
                        </div>
                        <div className="text-gray-600">
                          {dot.formatted_address.split(",")[0]}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
);
RouteItem.displayName = "RouteItem";

export default React.memo(InfoPanel);
