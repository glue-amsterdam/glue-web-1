"use client";

import {
  MapPin,
  MapPinIcon as MapPinHouse,
  MapPinIcon as MapPinMinusInside,
  Circle,
} from "lucide-react";
import { markerColors } from "./legend-config";
import { Marker } from "react-map-gl";
import { memo, useState, useEffect } from "react";

interface Location {
  id: string;
  longitude: number;
  latitude: number;
  is_hub?: boolean;
  is_collective?: boolean;
  is_special_program?: boolean;
  isRouteMarker?: boolean;
  display_number?: string | null;
  hub_display_number?: string | null;
  participants?: Array<{
    user_name: string;
    is_host: boolean;
  }>;
}

interface MemoizedMarkerProps {
  location: Location;
  onClick?: (e: { originalEvent: { stopPropagation: () => void } }) => void;
  isRouteMarker?: boolean;
  routeStep?: number;
  isSelected?: boolean;
  index?: number; // Add index for staggered animation
  mapLoaded?: boolean; // Add mapLoaded prop
}

export const MemoizedMarker = memo(
  ({
    location,
    onClick,
    isRouteMarker,
    routeStep,
    isSelected = false,
    index = 0,
    mapLoaded = false,
  }: MemoizedMarkerProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Staggered entrance animation - wait for map to load first
    useEffect(() => {
      if (!mapLoaded) return; // Don't start animation until map is loaded

      const initialDelay = 300; // 0.3 seconds initial delay
      const staggerDelay = index * 100; // 100ms between each marker
      const totalDelay = initialDelay + staggerDelay;

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, totalDelay);

      return () => clearTimeout(timer);
    }, [mapLoaded, index]);

    // Trigger pop animation when marker becomes selected
    useEffect(() => {
      if (isSelected && !isAnimating) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(timer);
      }
    }, [isSelected, isAnimating]);

    // Get participant name for tooltip
    const getParticipantName = () => {
      if (!location.participants || location.participants.length === 0) {
        return "Unknown";
      }

      if (location.participants.length === 1) {
        return location.participants[0].user_name;
      }

      // For hubs/collectives, show the host first
      const host = location.participants.find((p) => p.is_host);
      if (host) {
        return `${host.user_name} + ${location.participants.length - 1} more`;
      }

      return `${location.participants[0].user_name} + ${
        location.participants.length - 1
      } more`;
    };

    // Determine marker styling based on type
    const getMarkerStyle = () => {
      if (isRouteMarker) {
        return {
          containerClass:
            "size-8 rounded-full flex items-center justify-center shadow-md border-2 border-white",
          bgClass: markerColors.route.background,
          icon: Circle,
          iconClass: "w-4 h-4 text-white",
        };
      }

      // Determine if this should be shown as a HUB (3+ participants) or Participant (<3 participants)
      // According to legend: GLUE HUB = 3 or more participants, Up to 3 GLUE participants = participant
      // But also respect the is_hub flag from the database
      const isHub =
        location.is_hub ||
        (location.participants && location.participants.length >= 3);

      if (isHub) {
        return {
          containerClass:
            "size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
          bgClass: markerColors.hub.background,
          icon: MapPinHouse,
          iconClass: "w-5 h-5 text-white",
          textClass: markerColors.hub.text,
        };
      }

      if (location.is_special_program) {
        return {
          containerClass:
            "size-7 rounded-full  flex items-center justify-center shadow-md transition-transform hover:scale-110",
          bgClass: markerColors.specialProgram.background,
          icon: MapPinMinusInside,
          iconClass: "w-5 h-5 text-white",
          textClass: markerColors.specialProgram.text,
        };
      }

      // Default participant marker (including collective with <3 participants)
      return {
        containerClass:
          "size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
        bgClass: markerColors.participant.background,
        icon: MapPin,
        iconClass: "w-5 h-5 text-black",
        textClass: markerColors.participant.text,
      };
    };

    const markerStyle = getMarkerStyle();
    const IconComponent = markerStyle.icon;

    return (
      <Marker
        longitude={location.longitude}
        latitude={location.latitude}
        anchor="top"
        onClick={isRouteMarker ? undefined : onClick}
      >
        <div
          className={`relative cursor-${
            isRouteMarker ? "default" : "pointer"
          } ${isVisible ? "marker-entrance" : "opacity-0 scale-0"}`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={`${markerStyle.containerClass} ${markerStyle.bgClass} ${
              isAnimating ? "marker-pop" : ""
            }`}
          >
            {location.hub_display_number || location.display_number ? (
              <span className={`text-sm font-bold ${markerStyle.textClass}`}>
                {location.hub_display_number || location.display_number}
              </span>
            ) : isRouteMarker && routeStep ? (
              <span className="text-sm font-bold">{routeStep}</span>
            ) : (
              <IconComponent className={markerStyle.iconClass} />
            )}
          </div>

          {/* Tooltip */}
          {showTooltip && !isRouteMarker && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
              {getParticipantName()}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
            </div>
          )}
        </div>
      </Marker>
    );
  }
);

MemoizedMarker.displayName = "MemoizedMarker";
