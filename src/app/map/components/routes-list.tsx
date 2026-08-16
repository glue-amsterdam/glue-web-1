"use client";

import { useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MapRoute } from "@/lib/map/types";
import { cn } from "@/lib/utils";

type RoutesListProps = {
  routes: MapRoute[];
  selectedRoute: string | null;
  onRouteSelect: (routeId: string) => void;
  variant?: "sidebar" | "panel";
  className?: string;
  onRouteSelected?: () => void;
};

const RoutesList = ({
  routes,
  selectedRoute,
  onRouteSelect,
  variant = "sidebar",
  className,
  onRouteSelected,
}: RoutesListProps) => {
  const sortedRoutes = useMemo(
    () => routes.toSorted((routeA, routeB) => routeA.name.localeCompare(routeB.name)),
    [routes]
  );

  const handleRouteClick = useCallback(
    (routeId: string) => {
      onRouteSelect(routeId);
      onRouteSelected?.();
    },
    [onRouteSelect, onRouteSelected]
  );

  const routeButtonClassName = cn(
    "w-full text-left flex gap-[15px] cursor-pointer",
    variant === "panel" && "max-w-[90%]",
    variant === "sidebar" && "max-w-[237px]"
  );

  const listContent = (
    <ul className="py-[30px] flex flex-col gap-[30px]">
      {sortedRoutes.map((route) => (
        <li key={route.id}>
          <button
            type="button"
            onClick={() => handleRouteClick(route.id)}
            aria-pressed={selectedRoute === route.id}
            className={routeButtonClassName}
          >
            <p
              className={cn(
                "min-w-0 flex-1 versal-body-text",
                variant === "panel" && "truncate",
                variant === "sidebar" && "whitespace-normal wrap-break-word"
              )}
            >
              {route.name}
            </p>
          </button>
        </li>
      ))}
      {sortedRoutes.length === 0 && (
        <li className="base-text-size text-(--gray-color)">
          No routes available.
        </li>
      )}
    </ul>
  );

  if (variant === "panel") {
    return <div className={className}>{listContent}</div>;
  }

  return (
    <ScrollArea className={cn("flex-1 min-h-0", className)}>
      {listContent}
    </ScrollArea>
  );
};

export default RoutesList;
