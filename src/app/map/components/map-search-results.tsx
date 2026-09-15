"use client";

import type { KeyboardEvent } from "react";
import DisplayNumberCluster from "@/components/display-number-cluster";
import type { MapLocation, MapRoute } from "@/lib/map/types";
import { getMapLocationNumberBadges } from "@/lib/map/map-filters";
import { cn } from "@/lib/utils";

type MapSearchResultsProps = {
  locations: MapLocation[];
  routes: MapRoute[];
  onExhibitorSelect: (locationId: string) => void;
  onRouteSelect: (routeId: string) => void;
  className?: string;
};

type MapSearchExhibitorResultProps = {
  location: MapLocation;
  onSelect: (locationId: string) => void;
};

type MapSearchRouteResultProps = {
  route: MapRoute;
  onSelect: (routeId: string) => void;
};

const resultButtonClassName =
  "flex w-full items-center gap-[15px] py-[10px] text-left cursor-pointer base-text-size";

const MapSearchExhibitorResult = ({
  location,
  onSelect,
}: MapSearchExhibitorResultProps) => {
  const numberBadges = getMapLocationNumberBadges(location);

  const handleClick = () => {
    onSelect(location.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleClick();
  };

  return (
    <li>
      <button
        type="button"
        role="option"
        tabIndex={0}
        aria-label={location.name}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={resultButtonClassName}
      >
        <DisplayNumberCluster
          badges={numberBadges}
          fallbackType={location.type}
        />
        <span className="min-w-0 flex-1 truncate">{location.name}</span>
      </button>
    </li>
  );
};

const MapSearchRouteResult = ({
  route,
  onSelect,
}: MapSearchRouteResultProps) => {
  const handleClick = () => {
    onSelect(route.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleClick();
  };

  return (
    <li>
      <button
        type="button"
        role="option"
        tabIndex={0}
        aria-label={route.name}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={resultButtonClassName}
      >
        <span className="min-w-0 flex-1 whitespace-normal wrap-break-word">
          {route.name}
        </span>
      </button>
    </li>
  );
};

const MapSearchResults = ({
  locations,
  routes,
  onExhibitorSelect,
  onRouteSelect,
  className,
}: MapSearchResultsProps) => {
  if (locations.length === 0 && routes.length === 0) {
    return null;
  }

  const hasLocations = locations.length > 0;
  const hasRoutes = routes.length > 0;

  return (
    <div
      role="listbox"
      aria-label="Search results"
      className={cn("flex w-full flex-col base-text-size pb-[70px]", className)}
    >
      {hasLocations && (
        <ul className="flex flex-col gap-[30px] pt-[30px]">
          {locations.map((location) => (
            <MapSearchExhibitorResult
              key={location.id}
              location={location}
              onSelect={onExhibitorSelect}
            />
          ))}
        </ul>
      )}

      {hasLocations && hasRoutes && (
        <div
          className="main-boder-top mt-[30px]"
          aria-hidden
        />
      )}

      {hasRoutes && (
        <ul className="flex flex-col gap-[30px] py-[30px]">
          {routes.map((route) => (
            <MapSearchRouteResult
              key={route.id}
              route={route}
              onSelect={onRouteSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default MapSearchResults;
