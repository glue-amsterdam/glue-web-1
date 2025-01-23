"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { MapInfo, Route, useMapData } from "@/app/hooks/useMapData";
import { InfoPanel } from "@/app/map/info-panel";
import MapComponent from "@/app/map/map-component";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useSearchParams } from "next/navigation";
import CenteredLoader from "@/app/components/centered-loader";

interface MapMainProps {
  initialData: {
    mapInfo: MapInfo[];
    routes: Route[];
  };
}

export default function MapMain({ initialData }: MapMainProps) {
  const {
    mapInfo,
    routes,
    error,
    isLoading,
    selectedLocation,
    selectedRoute,
    setSelectedLocation,
    setSelectedRoute,
    updateURL,
    fetchLocationData,
  } = useMapData(initialData);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const placeId = searchParams.get("place");
    const routeId = searchParams.get("route");

    if (placeId) {
      setSelectedLocation(placeId);
    } else if (routeId) {
      setSelectedRoute(routeId);
    }
  }, [searchParams, setSelectedLocation, setSelectedRoute]);

  const handleParticipantSelect = useCallback(
    (locationId: string) => {
      setSelectedLocation(locationId);
      setSelectedRoute("");
      updateURL({ place: locationId });
      if (!isLargeScreen) {
        setIsSheetOpen(false);
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
        setIsSheetOpen(false);
      }
    },
    [setSelectedRoute, setSelectedLocation, updateURL, isLargeScreen]
  );

  if (error) {
    return (
      <div className="p-4 text-red-500">Failed to load map data: {error}</div>
    );
  }

  if (isLoading) {
    return <CenteredLoader />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <h1 className="sr-only">City Map</h1>
      {isLargeScreen ? (
        <div className="flex flex-1">
          <aside
            className="w-1/3 bg-card h-full overflow-auto"
            aria-label="Participant and route list"
          >
            <InfoPanel
              mapInfo={mapInfo}
              routes={routes}
              selectedLocation={selectedLocation}
              selectedRoute={selectedRoute}
              onParticipantSelect={handleParticipantSelect}
              onRouteSelect={handleRouteSelect}
              updateURL={updateURL}
            />
          </aside>
          <main className="w-2/3 relative h-full" aria-label="Map">
            <MapComponent
              mapInfo={mapInfo}
              routes={routes}
              selectedRoute={selectedRoute}
              selectedLocation={selectedLocation}
              setSelectedLocation={handleParticipantSelect}
              setSelectedRoute={handleRouteSelect}
              updateURL={updateURL}
              fetchLocationData={fetchLocationData}
            />
          </main>
        </div>
      ) : (
        <>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-24 left-4 z-10 text-black"
                aria-label="Open participant and route list"
                onClick={() => setIsSheetOpen(true)}
              >
                <MenuIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] text-black overflow-y-auto"
            >
              <SheetTitle className="sr-only">
                Participant and Route List
              </SheetTitle>
              <SheetDescription className="sr-only">
                Open Participant and Route List
              </SheetDescription>
              <nav aria-label="Participant and route list">
                <InfoPanel
                  mapInfo={mapInfo}
                  routes={routes}
                  selectedLocation={selectedLocation}
                  selectedRoute={selectedRoute}
                  onParticipantSelect={handleParticipantSelect}
                  onRouteSelect={handleRouteSelect}
                  updateURL={updateURL}
                  className="mt-8"
                />
              </nav>
            </SheetContent>
          </Sheet>
          <main className="flex-1 relative w-full h-full" aria-label="Map">
            <MapComponent
              mapInfo={mapInfo}
              routes={routes}
              selectedRoute={selectedRoute}
              selectedLocation={selectedLocation}
              setSelectedLocation={handleParticipantSelect}
              setSelectedRoute={handleRouteSelect}
              updateURL={updateURL}
              fetchLocationData={fetchLocationData}
            />
          </main>
        </>
      )}
    </div>
  );
}
