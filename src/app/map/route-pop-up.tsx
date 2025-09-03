"use client";

import { memo, useCallback } from "react";
import { X, MapPin } from "lucide-react";
import { Popup } from "react-map-gl";
import type { Route, MapInfo } from "@/app/hooks/useMapData";
import { Button } from "@/components/ui/button";
import { markerColors } from "./legend-config";

interface RoutePopupProps {
  route: Route;
  handlePopupClose: () => void;
  mapInfo: MapInfo[];
}

function RoutePopupComponent({
  route,
  handlePopupClose,
  mapInfo,
}: RoutePopupProps) {
  // Use the first dot's coordinates for the popup position
  const firstDot = route.dots[0];

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
    <Popup
      longitude={firstDot.longitude}
      latitude={firstDot.latitude}
      onClose={handlePopupClose}
      closeButton={false}
      closeOnClick={false}
      className="custom-map-popup route-popup transition-all text-black"
      anchor="top"
      offset={[0, -15]} // Add offset to avoid covering dots
    >
      <div className="popup-wrapper">
        <button
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
                {route.dots.map((dot, index) => {
                  // Find the corresponding location in mapInfo
                  const location = mapInfo.find((loc) =>
                    loc.participants.some((p) => p.user_name === dot.user_name)
                  );

                  // Get display number
                  const displayNumber = location
                    ? location.hub_display_number ||
                      location.display_number ||
                      location.participants[0]?.display_number
                    : null;

                  const hasDisplayNumber = !!displayNumber;

                  // Determine marker type and colors
                  const isHub =
                    location?.is_hub ||
                    (location?.participants &&
                      location.participants.length >= 3);
                  const isSpecialProgram = location?.is_special_program;

                  // Get the appropriate colors based on marker type
                  const getColorsForInlineStyle = () => {
                    if (hasDisplayNumber) {
                      if (isHub) {
                        return {
                          backgroundColor: markerColors.hub.hex,
                          color: "white",
                        };
                      } else if (isSpecialProgram) {
                        return {
                          backgroundColor: markerColors.specialProgram.hex,
                          color: "white",
                        };
                      } else {
                        return {
                          backgroundColor: markerColors.participant.hex,
                          color: "black",
                        };
                      }
                    } else {
                      return {
                        backgroundColor: markerColors.route.hex,
                        color: "white",
                      };
                    }
                  };

                  const inlineStyles = getColorsForInlineStyle();

                  return (
                    <div key={dot.id} className="route-stop">
                      <div className="route-stop-number" style={inlineStyles}>
                        {hasDisplayNumber ? displayNumber : index + 1}
                      </div>
                      <div className="route-stop-details">
                        <p className="route-stop-name">{dot.user_name}</p>
                        <p className="route-stop-address">
                          {dot.formatted_address.split(",")[0]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Google Maps Button */}
            <div className="mt-4 pb-2">
              <Button
                onClick={redirectRouteToGoogleMaps}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <MapPin className="w-4 h-4 mr-2" />
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
