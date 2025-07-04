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
import RouteFooter from "@/app/map/route-footer";
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
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

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
      setSelectedLocation(locationId);
      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    },
    [setSelectedLocation, isLargeScreen]
  );

  const handleRouteSelect = useCallback(
    (routeId: string) => {
      setSelectedRoute(routeId);
      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    },
    [setSelectedRoute, isLargeScreen]
  );

  // Get the selected route object for the footer
  const selectedRouteObject = selectedRoute
    ? routes.find((r) => r.id === selectedRoute) || null
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <h1 className="sr-only">City Map</h1>
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
        <div className="flex flex-col h-full relative">
          {/* Overlay when sidebar is open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-[52]"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
          )}

          {/* Custom sliding sidebar */}
          <aside
            className={cn(
              "fixed top-0 left-0 h-full w-[85vw] max-w-[400px] bg-card z-[52] overflow-hidden transition-transform duration-300 ease-in-out transform",
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
            <div
              className="overflow-y-auto"
              style={{
                height: "calc(var(--vh, 1vh) * 100 - 64px)",
                WebkitOverflowScrolling: "touch",
              }}
            >
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
            className={cn(
              "flex-1 h-full w-full",
              selectedRouteObject && "pb-24"
            )}
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

          {/* Route Footer for mobile */}
          {selectedRouteObject && (
            <RouteFooter
              route={selectedRouteObject}
              onClose={() => setSelectedRoute("")}
            />
          )}
        </div>
      )}
    </div>
  );
}
export default MapMain;
