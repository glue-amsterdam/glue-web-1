"use client";

import { useRef } from "react";
import { useMapFilterPanel } from "@/app/map/stores/use-map-store";
import { cn } from "@/lib/utils";
import {
  getMapFilterAriaLabel,
  MapFilterPanelContent,
} from "./map-filter-panel-content";

const MapFilterDesktopSidebar = () => {
  const filterPanelStore = useMapFilterPanel();
  const sidebarRef = useRef<HTMLElement>(null);

  const openFilter = filterPanelStore?.openFilter ?? null;
  const openPanelId = filterPanelStore?.openPanelId ?? null;

  if (!openFilter || !openPanelId) return null;

  return (
    <aside
      ref={sidebarRef}
      id={openPanelId}
      role="group"
      aria-label={getMapFilterAriaLabel(openFilter)}
      className={cn(
        "absolute top-(--nav-secondary-h) left-0 z-10 w-[295px] h-full",
        "overflow-y-auto bg-(--white-color)",
        "pointer-events-auto"
      )}
    >
      <MapFilterPanelContent filterId={openFilter} variant="sidebar" />
    </aside>
  );
};

export default MapFilterDesktopSidebar;
