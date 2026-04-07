"use client";

import { memo, useCallback } from "react";
import { X, MapPin, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MapInfo, Route } from "@/app/hooks/useMapData";
import { getRouteStopsForDisplay } from "@/app/map/route-stop-display";

interface RouteFooterProps {
  route: Route;
  mapInfo: MapInfo[];
  onDownloadRoutePdf: () => void | Promise<void>;
  onClose: () => void;
}

function RouteFooterComponent({
  route,
  mapInfo,
  onDownloadRoutePdf,
  onClose,
}: RouteFooterProps) {
  const stops = getRouteStopsForDisplay(route, mapInfo);

  const redirectRouteToGoogleMaps = useCallback(() => {
    if (route.dots.length === 0) return;

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
  }, [route.dots]);

  const handleDownloadPdfClick = useCallback(() => {
    void onDownloadRoutePdf();
  }, [onDownloadRoutePdf]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-black border-t border-gray-200 shadow-lg z-50 transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{route.name}</h3>
            {route.description && (
              <p className="text-sm text-gray-600 truncate">
                {route.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close route details"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div>
        <ScrollArea className="max-h-72 overflow-y-auto">
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              {stops.map((stop) => (
                <div key={stop.dotId} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: stop.backgroundColor,
                      color: stop.color,
                    }}
                  >
                    {stop.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-black">
                      {stop.userName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 break-words">
                      {stop.addressLine}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPdfClick}
                className="w-full"
                size="sm"
                aria-label="Download route as PDF"
              >
                <FileDown className="w-4 h-4 mr-2" aria-hidden="true" />
                Download PDF
              </Button>
              <Button
                type="button"
                onClick={redirectRouteToGoogleMaps}
                className="w-full bg-primary hover:bg-primary/90"
                size="sm"
              >
                <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                View Route in Google Maps
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

const MemoizedRouteFooterComponent = memo(RouteFooterComponent);

export default MemoizedRouteFooterComponent;
