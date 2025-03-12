"use client";

import type React from "react";
import { useCallback, useState, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon, X } from "lucide-react";
import { type MapInfo, type Route, useMapData } from "@/app/hooks/useMapData";
import Memoinfo from "@/app/map/info-panel";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import MemoizedMapComponent from "@/app/map/map-component";
import { cn } from "@/lib/utils";

interface MapMainProps {
  initialData: {
    mapInfo: MapInfo[];
    routes: Route[];
  };
}

function MapMain({ initialData }: MapMainProps) {
  const {
    mapInfo,
    routes,
    selectedLocation,
    selectedRoute,
    setSelectedLocation,
    setSelectedRoute,
    updateURL,
  } = useMapData(initialData);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when switching to large screen
  useEffect(() => {
    if (isLargeScreen) {
      setSidebarOpen(false);
    }
  }, [isLargeScreen]);

  const handleParticipantSelect = useCallback(
    (locationId: string) => {
      setSelectedLocation(locationId);
      setSelectedRoute("");
      updateURL({ place: locationId });
      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    },
    [setSelectedLocation, setSelectedRoute, updateURL, isLargeScreen]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      setSelectedRoute(routeId);
      setSelectedLocation("");
      updateURL({ route: routeId });
      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    },
    [setSelectedRoute, setSelectedLocation, updateURL, isLargeScreen]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Handle clicking outside to close sidebar on mobile
  const handleOutsideClick = useCallback(() => {
    if (!isLargeScreen && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isLargeScreen, sidebarOpen]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <h1 className="sr-only">City Map</h1>

      {/* Desktop Layout */}
      {isLargeScreen ? (
        <div className="flex flex-1 h-full">
          <aside
            className="w-1/3 bg-card h-full overflow-auto border-r"
            aria-label="Participant and route list"
          >
            <Memoinfo
              mapInfo={mapInfo}
              routes={routes}
              setSelectedLocation={setSelectedLocation}
              setSelectedRoute={setSelectedRoute}
              selectedLocation={selectedLocation}
              selectedRoute={selectedRoute}
              onParticipantSelect={handleParticipantSelect}
              onRouteSelect={handleRouteSelect}
              updateURL={updateURL}
            />
          </aside>
          <main className="w-2/3 relative h-full" aria-label="Map">
            <MemoizedMapComponent
              mapInfo={mapInfo}
              routes={routes}
              setSelectedLocation={setSelectedLocation}
              setSelectedRoute={setSelectedRoute}
              selectedLocation={selectedLocation}
              selectedRoute={selectedRoute}
              onParticipantSelect={handleParticipantSelect}
              onRouteSelect={handleRouteSelect}
              updateURL={updateURL}
            />
          </main>
        </div>
      ) : (
        /* Mobile Layout with custom sliding sidebar */
        <div className="flex flex-col h-full relative">
          {/* Overlay when sidebar is open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-20"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
          )}

          {/* Custom sliding sidebar */}
          <aside
            className={cn(
              "fixed top-0 left-0 h-full w-[85vw] max-w-[400px] bg-card z-30 overflow-hidden transition-transform duration-300 ease-in-out transform",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
            aria-label="Participant and route list"
            aria-hidden={!sidebarOpen}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Locations & Routes</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-64px)]">
              <Memoinfo
                mapInfo={mapInfo}
                routes={routes}
                setSelectedLocation={setSelectedLocation}
                setSelectedRoute={setSelectedRoute}
                selectedLocation={selectedLocation}
                selectedRoute={selectedRoute}
                onParticipantSelect={handleParticipantSelect}
                onRouteSelect={handleRouteSelect}
                updateURL={updateURL}
              />
            </div>
          </aside>

          {/* Toggle button */}
          <div
            className={`fixed top-24 left-4 z-40 text-black ${
              sidebarOpen ? "hidden" : ""
            }`}
          >
            <Button
              variant="outline"
              size="icon"
              className="bg-background shadow-md"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              onClick={toggleSidebar}
            >
              <MenuIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Map takes full width on mobile */}
          <main
            className="flex-1 h-full w-full"
            aria-label="Map"
            onClick={handleOutsideClick}
          >
            <MemoizedMapComponent
              mapInfo={mapInfo}
              routes={routes}
              setSelectedLocation={setSelectedLocation}
              setSelectedRoute={setSelectedRoute}
              selectedLocation={selectedLocation}
              selectedRoute={selectedRoute}
              onParticipantSelect={handleParticipantSelect}
              onRouteSelect={handleRouteSelect}
              updateURL={updateURL}
            />
          </main>
        </div>
      )}
    </div>
  );
}

const MemoMapMain = memo(MapMain);

export default MemoMapMain;
