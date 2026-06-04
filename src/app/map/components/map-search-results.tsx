"use client";

import { useCallback } from "react";
import { RouteIcon } from "lucide-react";
import RoundedNumber from "@/components/rounded-number";
import type { MapLocation, MapRoute } from "@/lib/map/types";
import { cn } from "@/lib/utils";

type MapSearchResultsProps = {
  locations: MapLocation[];
  routes: MapRoute[];
  onExhibitorSelect: (locationId: string) => void;
  onRouteSelect: (routeId: string) => void;
  className?: string;
};

const MapSearchResults = ({
  locations,
  routes,
  onExhibitorSelect,
  onRouteSelect,
  className,
}: MapSearchResultsProps) => {
  const handleExhibitorClick = useCallback(
    (locationId: string) => {
      onExhibitorSelect(locationId);
    },
    [onExhibitorSelect]
  );

  const handleRouteClick = useCallback(
    (routeId: string) => {
      onRouteSelect(routeId);
    },
    [onRouteSelect]
  );

  if (locations.length === 0 && routes.length === 0) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-label="Search results"
      className={cn(
        "absolute top-full left-0 z-51 w-full overflow-y-auto border-b border-(--black-color) bg-(--white-color) max-h-[300px] flex flex-col justify-center",
        className
      )}
    >
      {locations.length > 0 && (
        <div>
          <ul>
            {locations.map((location) => {
              const displayNumber = location.displayNumber ?? " ";
              return (
                <li key={location.id}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => handleExhibitorClick(location.id)}
                    className="flex w-full items-center gap-[15px] py-[12px] pl-[4px] base-text-size"
                  >
                    <RoundedNumber
                      type={location.type}
                      participant_n={displayNumber}
                    />
                    <span className="truncate">
                      {location.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {routes.length > 0 && (
        <div>
          <ul>
            {routes.map((route) => (
              <li key={route.id}>
                <button
                  type="button"
                  role="option"
                  onClick={() => handleRouteClick(route.id)}
                  className="flex w-full items-center gap-[15px] py-[12px] pl-[4px] base-text-size"
                >
                  <span className="truncate">{route.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapSearchResults;
