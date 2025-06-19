"use client";

import { memo, useCallback } from "react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Route } from "@/app/hooks/useMapData";

interface RouteFooterProps {
  route: Route;
  onClose: () => void;
}

function RouteFooterComponent({ route, onClose }: RouteFooterProps) {
  // Fixed Google Maps redirection function
  const redirectRouteToGoogleMaps = useCallback(() => {
    if (route.dots.length === 0) return;

    // Get first and last points
    const origin = `${route.dots[0].latitude},${route.dots[0].longitude}`;
    const destination = `${route.dots[route.dots.length - 1].latitude},${
      route.dots[route.dots.length - 1].longitude
    }`;

    // Get waypoints (excluding first and last points)
    const waypoints = route.dots
      .slice(1, -1) // Remove first and last dots to avoid duplication
      .map((dot) => `${dot.latitude},${dot.longitude}`)
      .join("|");

    // Build the URL
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    // Only add waypoints parameter if there are waypoints
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    window.open(url, "_blank");
  }, [route.dots]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-black border-t border-gray-200 shadow-lg z-50 transition-all duration-300">
      {/* Header with route name and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg  truncate">{route.name}</h3>
            {route.description && (
              <p className="text-sm text-gray-600 truncate">
                {route.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
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
              {route.dots.map((dot, index) => (
                <div key={dot.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-black">
                      {dot.user_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 break-words">
                      {dot.formatted_address}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                onClick={redirectRouteToGoogleMaps}
                className="w-full bg-primary hover:bg-primary/90"
                size="sm"
              >
                <MapPin className="w-4 h-4 mr-2" />
                View Route in Google Maps
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
      )
    </div>
  );
}

const MemoizedRouteFooterComponent = memo(RouteFooterComponent);

export default MemoizedRouteFooterComponent;
