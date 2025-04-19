"use client";

import type React from "react";
import { useCallback, useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon, X } from "lucide-react";
import { type MapInfo, type Route, useMapData } from "@/app/hooks/useMapData";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { cn } from "@/lib/utils";
import MapComponent from "@/app/map/map-component";
import InfoPanel from "@/app/map/info-panel";
import { LoadingFallback } from "@/app/components/loading-fallback";

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
  } = useMapData(initialData);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLargeScreen) {
      setSidebarOpen(false);
    }
  }, [isLargeScreen]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleOutsideClick = useCallback(() => {
    if (!isLargeScreen && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isLargeScreen, sidebarOpen]);

  const handleLocationSelect = useCallback(
    (locationId: string) => {
      console.log("Location selected in main:", locationId);
      setSelectedLocation(locationId);
      // Cerrar el panel móvil después de seleccionar
      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    },
    [setSelectedLocation, isLargeScreen]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      console.log("Route selected in main:", routeId);
      setSelectedRoute(routeId);
      // Cerrar el panel móvil después de seleccionar
      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    },
    [setSelectedRoute, isLargeScreen]
  );

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
            <InfoPanel
              mapInfo={mapInfo}
              routes={routes}
              selectedLocation={selectedLocation}
              selectedRoute={selectedRoute}
              onLocationSelect={handleLocationSelect}
              onRouteSelect={handleRouteSelect}
            />
          </aside>
          <main className="w-2/3 relative h-full" aria-label="Map">
            <Suspense fallback={<LoadingFallback />}>
              <MapComponent
                mapInfo={mapInfo}
                routes={routes}
                selectedLocation={selectedLocation}
                selectedRoute={selectedRoute}
                onLocationSelect={setSelectedLocation}
                onRouteSelect={setSelectedRoute}
              />
            </Suspense>
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
              <InfoPanel
                mapInfo={mapInfo}
                routes={routes}
                selectedLocation={selectedLocation}
                selectedRoute={selectedRoute}
                onLocationSelect={handleLocationSelect}
                onRouteSelect={handleRouteSelect}
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
            <Suspense fallback={<LoadingFallback />}>
              <MapComponent
                mapInfo={mapInfo}
                routes={routes}
                selectedLocation={selectedLocation}
                selectedRoute={selectedRoute}
                onLocationSelect={setSelectedLocation}
                onRouteSelect={setSelectedRoute}
              />
            </Suspense>
          </main>
        </div>
      )}
    </div>
  );
}
export default MapMain;
