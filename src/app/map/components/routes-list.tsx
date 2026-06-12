"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AccordionPlusCrossIcon from "@/components/icons/accordion-plus-cross-icon";
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
  groupByZone?: boolean;
};

const EMPTY_ZONE_LABEL = "Other";

const getZoneId = (zone: string, index: number) =>
  `route-zone-${index}-${zone
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const groupRoutesByZone = (routes: MapRoute[]) => {
  const grouped = new Map<string, MapRoute[]>();

  for (const route of routes) {
    const zone = route.zone.trim() || EMPTY_ZONE_LABEL;
    const zoneRoutes = grouped.get(zone) ?? [];
    zoneRoutes.push(route);
    grouped.set(zone, zoneRoutes);
  }

  return [...grouped.entries()]
    .sort(([zoneA], [zoneB]) => zoneA.localeCompare(zoneB))
    .map(([zone, zoneRoutes]) => ({
      zone,
      routes: [...zoneRoutes].sort((routeA, routeB) =>
        routeA.name.localeCompare(routeB.name)
      ),
    }));
};

const RoutesList = ({
  routes,
  selectedRoute,
  onRouteSelect,
  variant = "sidebar",
  className,
  onRouteSelected,
  groupByZone = false,
}: RoutesListProps) => {
  const [openZoneIds, setOpenZoneIds] = useState<string[]>([]);

  const routesByZone = useMemo(
    () => (groupByZone ? groupRoutesByZone(routes) : []),
    [groupByZone, routes]
  );

  const handleRouteClick = useCallback(
    (routeId: string) => {
      onRouteSelect(routeId);
      onRouteSelected?.();
    },
    [onRouteSelect, onRouteSelected]
  );

  const routeButtonClassName = cn(
    "w-full text-left flex items-center gap-[15px] base-text-size cursor-pointer",
    variant === "panel" && "py-[10px]",
    variant === "sidebar" && "p-2 rounded"
  );

  const renderRouteButton = (route: MapRoute) => (
    <li key={route.id}>
      <button
        type="button"
        onClick={() => handleRouteClick(route.id)}
        aria-pressed={selectedRoute === route.id}
        className={routeButtonClassName}
      >
        <p className="truncate">{route.name}</p>
      </button>
    </li>
  );

  const emptyState = (
    <p className="base-text-size text-(--gray-color) py-[10px]">
      No routes available.
    </p>
  );

  const flatListContent = (
    <ul className="py-[30px] lg:flex lg:flex-col lg:gap-[30px]">
      {routes.map(renderRouteButton)}
      {routes.length === 0 && (
        <li className="base-text-size text-(--gray-color) py-[10px]">
          No routes available.
        </li>
      )}
    </ul>
  );

  const accordionContent = (
    <Accordion
      type="multiple"
      className="w-full py-[30px] px-[15px]"
      aria-label="Routes by zone"
      value={openZoneIds}
      onValueChange={setOpenZoneIds}
    >
      {routesByZone.map(({ zone, routes: zoneRoutes }, index) => {
        const zoneId = getZoneId(zone, index);

        return (
          <AccordionItem key={zoneId} value={zoneId} className="border-b-0">
            <AccordionTrigger
              hideIcon
              className="group w-full base-text-size main-boder-top text-left hover:no-underline py-[15px]"
            >
              <div className="flex w-full flex-1 items-start justify-between gap-3">
                <span id={`${zoneId}-label`} className="min-w-0 flex-1 text-left">
                  {zone.toUpperCase()}
                </span>
                <AccordionPlusCrossIcon />
              </div>
            </AccordionTrigger>
            <AccordionContent aria-labelledby={`${zoneId}-label`}>
              <ul className="flex flex-col gap-[15px] pb-[15px]">
                {zoneRoutes.map(renderRouteButton)}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
      {routes.length === 0 && emptyState}
    </Accordion>
  );

  const listContent = groupByZone ? accordionContent : flatListContent;

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
