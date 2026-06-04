"use client";

import { useCallback } from "react";
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
  const handleRouteClick = useCallback(
    (routeId: string) => {
      onRouteSelect(routeId);
      onRouteSelected?.();
    },
    [onRouteSelect, onRouteSelected]
  );

  const listContent = (
    <ul className="py-[30px] lg:flex lg:flex-col lg:gap-[30px]">
      {routes.map((route) => (
        <li key={route.id}>
          <button
            type="button"
            onClick={() => handleRouteClick(route.id)}
            aria-pressed={selectedRoute === route.id}
            className={cn(
              "w-full text-left flex items-center gap-[15px] base-text-size cursor-pointer",
              variant === "panel" && "py-[10px]",
              variant === "sidebar" && "p-2 rounded"
            )}
          >
            <p className="truncate">{route.name}</p>
          </button>
        </li>
      ))}
      {routes.length === 0 && (
        <li className="base-text-size text-(--gray-color) py-[10px]">
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
