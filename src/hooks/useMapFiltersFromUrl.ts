"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMapStore } from "@/app/map/stores/use-map-store";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import type { MapFilters } from "@/lib/map/map-filters";
import {
  mergeMapFilters,
  shouldClearMapSelectionForExhibitorsView,
} from "@/lib/map/map-filter-actions";
import {
  buildMapPageUrl,
  isMapPageActive,
  searchParamsToMapFilters,
  type MapUrlSelection,
} from "@/lib/map/map-url";

type UseMapFiltersFromUrlReturn = {
  filters: MapFilters;
  /** Filters parsed from the URL only (no optimistic overlay). */
  urlFilters: MapFilters;
  applyFilters: (next: Partial<MapFilters>, selection?: MapUrlSelection) => void;
  previewFilters: (next: Partial<MapFilters>) => void;
  /** @deprecated Use applyFilters */
  updateFilters: (next: Partial<MapFilters>, selection?: MapUrlSelection) => void;
};

const mapFiltersEqual = (a: MapFilters, b: MapFilters): boolean =>
  a.type === b.type && a.view === b.view && a.q === b.q;

export const useMapFiltersFromUrl = (): UseMapFiltersFromUrlReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => searchParamsToMapFilters(searchParams),
    [searchParams]
  );

  const optimisticFilters = useMapStore((state) => state.optimisticFilters);
  const setOptimisticFilters = useMapStore((state) => state.setOptimisticFilters);
  const navigation = useMapStore((state) => state.navigation);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const filters = optimisticFilters ?? urlFilters;

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const lastRequestedFiltersRef = useRef<MapFilters | null>(null);

  useEffect(() => {
    if (!optimisticFilters) return;
    const lastRequested = lastRequestedFiltersRef.current;
    if (!lastRequested) return;
    if (!mapFiltersEqual(urlFilters, lastRequested)) return;
    setOptimisticFilters(null);
    lastRequestedFiltersRef.current = null;
  }, [urlFilters, optimisticFilters, setOptimisticFilters]);

  const previewFilters = useCallback(
    (next: Partial<MapFilters>) => {
      const merged = mergeMapFilters(filtersRef.current, next);
      setOptimisticFilters(merged);
    },
    [setOptimisticFilters]
  );

  const applyFilters = useCallback(
    (next: Partial<MapFilters>, selection?: MapUrlSelection) => {
      if (!isMapPageActive()) return;
      if (pathname !== "/map") return;

      const merged = mergeMapFilters(filtersRef.current, next);
      lastRequestedFiltersRef.current = merged;
      setOptimisticFilters(merged);

      if (navigation) {
        navigation.navigateMap({ filters: merged, selection });
        return;
      }

      let resolvedSelection = selection;
      if (
        !isLargeScreen &&
        shouldClearMapSelectionForExhibitorsView(merged, selection)
      ) {
        resolvedSelection = { ...selection, clearSelection: true };
      }

      const nextUrl = buildMapPageUrl(
        pathname,
        merged,
        searchParams,
        resolvedSelection
      );
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams, navigation, setOptimisticFilters, isLargeScreen]
  );

  return {
    filters,
    urlFilters,
    applyFilters,
    previewFilters,
    updateFilters: applyFilters,
  };
};
