"use client";

import {
  MapPin,
  MapPinIcon as MapPinHouse,
  MapPinIcon as MapPinMinusInside,
  MapPinIcon as MapPinPlus,
  Circle,
} from "lucide-react";
import { Marker } from "react-map-gl";
import { memo } from "react";

interface Location {
  id: string;
  longitude: number;
  latitude: number;
  is_hub?: boolean;
  is_collective?: boolean;
  is_special_program?: boolean;
  isRouteMarker?: boolean;
}

interface MemoizedMarkerProps {
  location: Location;
  onClick?: (e: { originalEvent: { stopPropagation: () => void } }) => void; // Hacer onClick opcional
  isRouteMarker?: boolean;
  routeStep?: number; // Add route step number
}

export const MemoizedMarker = memo(
  ({ location, onClick, isRouteMarker, routeStep }: MemoizedMarkerProps) => {
    // Determine marker styling based on type
    const getMarkerStyle = () => {
      if (isRouteMarker) {
        return {
          containerClass:
            "size-8 rounded-full flex items-center justify-center shadow-md border-2 border-white",
          bgClass: "bg-red-500",
          icon: Circle,
          iconClass: "w-4 h-4 text-white",
        };
      }

      if (location.is_hub) {
        return {
          containerClass:
            "size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
          bgClass: "bg-green-500 opacity-70 hover:opacity-100",
          icon: MapPinHouse,
          iconClass: "w-5 h-5 text-white",
        };
      }

      if (location.is_collective) {
        return {
          containerClass:
            "size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
          bgClass: "bg-yellow-500 opacity-70 hover:opacity-100",
          icon: MapPinPlus,
          iconClass: "w-5 h-5 text-white",
        };
      }

      if (location.is_special_program) {
        return {
          containerClass:
            "size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
          bgClass: "bg-purple-500 opacity-70 hover:opacity-100",
          icon: MapPinMinusInside,
          iconClass: "w-5 h-5 text-white",
        };
      }

      // Default participant marker
      return {
        containerClass:
          "size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
        bgClass: "bg-blue-500 opacity-70 hover:opacity-100",
        icon: MapPin,
        iconClass: "w-5 h-5 text-white",
      };
    };

    const markerStyle = getMarkerStyle();
    const IconComponent = markerStyle.icon;

    return (
      <Marker
        longitude={location.longitude}
        latitude={location.latitude}
        anchor="top"
        onClick={isRouteMarker ? undefined : onClick} // Disable click for route markers
      >
        <div
          className={`relative cursor-${isRouteMarker ? "default" : "pointer"}`}
        >
          <div
            className={`${markerStyle.containerClass} ${markerStyle.bgClass}`}
          >
            {isRouteMarker && routeStep ? (
              <span className="text-white text-xs font-bold">{routeStep}</span>
            ) : (
              <IconComponent className={markerStyle.iconClass} />
            )}
          </div>
        </div>
      </Marker>
    );
  }
);

MemoizedMarker.displayName = "MemoizedMarker";
