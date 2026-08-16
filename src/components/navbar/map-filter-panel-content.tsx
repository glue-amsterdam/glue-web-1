"use client";

import { useAuth } from "@/context/AuthContext";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import { useMapFiltersFromUrl } from "@/hooks/useMapFiltersFromUrl";
import {
  type MapFilterId,
  useMapFilterPanel,
  useMapPage,
} from "@/app/map/stores/use-map-store";
import ExhibitorList from "@/app/map/components/exhibitor-list";
import RoutesList from "@/app/map/components/routes-list";
import RoundedNumber from "../rounded-number";
import { cn } from "@/lib/utils";
import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";

export const MAP_FILTER_PANEL_CLASS =
  "lg:py-[25px] gap-[15px] lg:gap-[40px]";

export const MAP_CATEGORY_PANEL_CLASS =
  "flex-col items-stretch gap-[20px] py-[24px] lg:py-[30px]";

type MapFilterPanelContentProps = {
  filterId: MapFilterId;
  variant: "panel" | "sidebar";
  className?: string;
};

type CategoryPickerContentProps = {
  variant: "panel" | "sidebar";
  className?: string;
};

type CategoryExhibitorListContentProps = {
  variant: "panel" | "sidebar";
  categoryType: ExhibitorsFilterType;
  className?: string;
};

export const CategoryPickerContent = ({
  variant,
  className,
}: CategoryPickerContentProps) => {
  const filterPanelStore = useMapFilterPanel();
  const { filters } = useMapFiltersFromUrl();
  const { filterOptions } = useParticipantCategories();

  if (!filterPanelStore) return null;

  const { onTypeSelect } = filterPanelStore;

  return (
    <div
      className={cn(
        variant === "sidebar" && "flex flex-col gap-[20px] py-[30px]",
        variant === "panel" && "flex flex-col gap-[15px]",
        className
      )}
    >
      {filterOptions.map((option) => {
        const isActive = filters.type === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onTypeSelect(option.value)}
            className="text-left flex items-center gap-[15px] base-text-size max-w-[289px] lg:max-w-[237px] cursor-pointer"
          >
            <RoundedNumber type={option.value} participant_n="00" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const CategoryExhibitorListContent = ({
  variant,
  categoryType,
  className,
}: CategoryExhibitorListContentProps) => {
  const mapPageStore = useMapPage();
  const filterPanelStore = useMapFilterPanel();

  if (!filterPanelStore || !mapPageStore) return null;

  const { onExhibitorListSelect } = filterPanelStore;

  return (
    <div
      className={cn(
        variant === "sidebar" && "flex flex-col",
        className
      )}
    >
      <ExhibitorList
        locations={mapPageStore.filteredLocationsForList}
        selectedLocation={mapPageStore.selectedLocation}
        onLocationSelect={onExhibitorListSelect}
        categoryType={categoryType}
        variant={variant}
        itemsAlign="start"
      />
    </div>
  );
};

export const MapFilterPanelContent = ({
  filterId,
  variant,
  className,
}: MapFilterPanelContentProps) => {
  const mapPageStore = useMapPage();
  const filterPanelStore = useMapFilterPanel();
  const { user } = useAuth();
  const { filters } = useMapFiltersFromUrl();

  if (!filterPanelStore) return null;

  const {
    onExhibitorListSelect,
    onRouteListSelect,
    onRouteSelected,
  } = filterPanelStore;

  if (filterId === "exhibitors") {
    if (!mapPageStore) return null;

    const searchQuery = filters.q.trim();
    const showRoutesInSearch =
      Boolean(user) &&
      variant === "sidebar" &&
      searchQuery.length > 0 &&
      mapPageStore.filteredRoutesForList.length > 0;

    return (
      <div
        className={cn(
          variant === "sidebar" && "flex flex-col",
          className
        )}
      >
        <ExhibitorList
          locations={mapPageStore.filteredLocationsForList}
          selectedLocation={mapPageStore.selectedLocation}
          onLocationSelect={onExhibitorListSelect}
          categoryType={filters.type}
          variant={variant}
        />
        {showRoutesInSearch && (
          <div className="flex flex-col gap-[15px] border-t border-(--black-color) pt-[20px]">
            <p className="px-[30px] text-xs font-semibold uppercase tracking-wide text-(--gray-color)">
              Routes
            </p>
            <RoutesList
              routes={mapPageStore.filteredRoutesForList}
              selectedRoute={mapPageStore.selectedRoute}
              onRouteSelect={onRouteListSelect}
              variant="sidebar"
              onRouteSelected={onRouteSelected}
            />
          </div>
        )}
      </div>
    );
  }

  if (filterId === "routes") {
    if (!mapPageStore) return null;

    return (
      <RoutesList
        routes={mapPageStore.filteredRoutesForList}
        selectedRoute={mapPageStore.selectedRoute}
        onRouteSelect={onRouteListSelect}
        variant={variant}
        className={className}
        onRouteSelected={onRouteSelected}
      />
    );
  }

  if (filters.type !== "all" && mapPageStore) {
    return (
      <CategoryExhibitorListContent
        variant={variant}
        categoryType={filters.type}
        className={className}
      />
    );
  }

  return (
    <CategoryPickerContent variant={variant} className={className} />
  );
};

export const getMapFilterAriaLabel = (filterId: MapFilterId): string => {
  if (filterId === "exhibitors") return "Exhibitors list";
  if (filterId === "routes") return "Routes options";
  return "Category options";
};
