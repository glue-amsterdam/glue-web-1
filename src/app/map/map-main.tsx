"use client";

import React, { useCallback, useState, memo } from "react";
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
import Memoinfo from "@/app/map/info-panel";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import MemoizedMapComponent from "@/app/map/map-component";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <h1 className="sr-only">City Map</h1>
      {isLargeScreen ? (
        <div className="flex flex-1">
          <aside
            className="w-1/3 bg-card h-full overflow-auto"
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
                  className="mt-8"
                />
              </nav>
            </SheetContent>
          </Sheet>
          <main className="flex-1 relative w-full h-full" aria-label="Map">
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
        </>
      )}
    </div>
  );
}

const MemoMapMain = memo(MapMain);

export default MemoMapMain;
