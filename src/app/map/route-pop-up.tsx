"use client";

import { memo, useCallback } from "react";
import { X, MapPin, FileDown } from "lucide-react";
import { Popup } from "react-map-gl";
import type { Route, MapInfo } from "@/app/hooks/useMapData";
import { Button } from "@/components/ui/button";
import { getRouteStopsForDisplay } from "@/app/map/route-stop-display";

interface RoutePopupProps {
  route: Route;
  handlePopupClose: () => void;
  mapInfo: MapInfo[];
  onDownloadRoutePdf: () => void | Promise<void>;
}

function RoutePopupComponent({
  route,
  handlePopupClose,
  mapInfo,
  onDownloadRoutePdf,
}: RoutePopupProps) {
  const firstDot = route.dots[0];
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
    <Popup
      longitude={firstDot.longitude}
      latitude={firstDot.latitude}
      onClose={handlePopupClose}
      closeButton={false}
      closeOnClick={false}
      className="custom-map-popup route-popup transition-all text-black"
      anchor="top"
      offset={[0, -15]}
    >
      <div className="popup-wrapper">
        <button
          type="button"
          onClick={handlePopupClose}
          className="popup-close-btn"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="route-popup-content">
          <div className="p-4 pb-2">
            <h3 className="font-semibold text-lg">{route.name}</h3>
            {route.description && (
              <p className="text-sm text-gray-600 mt-1">{route.description}</p>
            )}
            <div className="mt-3">
              <div className="route-stops">
                {stops.map((stop) => (
                  <div key={stop.dotId} className="route-stop">
                    <div
                      className="route-stop-number"
                      style={{
                        backgroundColor: stop.backgroundColor,
                        color: stop.color,
                      }}
                    >
                      {stop.label}
                    </div>
                    <div className="route-stop-details">
                      <p className="route-stop-name">{stop.userName}</p>
                      <p className="route-stop-address">{stop.addressLine}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pb-2 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPdfClick}
                className="w-full"
                aria-label="Download route as PDF"
              >
                <FileDown className="w-4 h-4 mr-2" aria-hidden="true" />
                Download PDF
              </Button>
              <Button
                type="button"
                onClick={redirectRouteToGoogleMaps}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                View Route in Google Maps
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}

const MemoizedRoutePopupComponent = memo(RoutePopupComponent);

export default MemoizedRoutePopupComponent;
