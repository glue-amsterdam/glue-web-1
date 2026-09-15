"use client";

import { useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MapRoute } from "@/lib/map/types";
import { openRouteInGoogleMaps } from "@/lib/map/utils";
import { cn } from "@/lib/utils";
import SelectedRouteBlock from "./selected-route-block";

type RoutesListProps = {
  routes: MapRoute[];
  selectedRoute: string | null;
  onRouteSelect: (routeId: string) => void;
  onDownloadSelectedRoute?: () => void | Promise<void>;
  variant?: "sidebar" | "panel";
  className?: string;
  onRouteSelected?: () => void;
};

const RoutesList = ({
  routes,
  selectedRoute,
  onRouteSelect,
  onDownloadSelectedRoute,
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

  const handleNavigate = useCallback((route: MapRoute) => {
    openRouteInGoogleMaps(route);
  }, []);

  const handleDownload = useCallback(() => {
    void onDownloadSelectedRoute?.();
  }, [onDownloadSelectedRoute]);

  const nameClassName = cn(
    variant === "panel" && "truncate",
    variant === "sidebar" && "whitespace-normal wrap-break-word"
  );

  const itemClassName = cn(
    "w-full max-w-full",
    variant === "panel" && "max-w-[90%]",
    variant === "sidebar" && "max-w-[237px]"
  );

  const listContent = (
    <ul className="flex flex-col gap-[30px] py-[30px]">
      {sortedRoutes.map((route) => {
        const isSelected = selectedRoute === route.id;

        return (
          <li key={route.id} className={itemClassName}>
            <SelectedRouteBlock
              routeName={route.name}
              isSelected={isSelected}
              onSelect={() => handleRouteClick(route.id)}
              onNavigate={() => handleNavigate(route)}
              onDownload={handleDownload}
              nameClassName={nameClassName}
            />
          </li>
        );
      })}
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
    <ScrollArea className={cn("min-h-0 flex-1", className)}>
      {listContent}
    </ScrollArea>
  );
};

export default RoutesList;
