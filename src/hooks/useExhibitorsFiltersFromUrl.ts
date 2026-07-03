"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ExhibitorsFilters } from "@/lib/participants/exhibitors-filters";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import {
  buildExhibitorsPageUrl,
  getExhibitorsUrlCleanupTarget,
  getExhibitorsVisibleCount,
  searchParamsToFilters,
} from "@/lib/participants/exhibitors-url";

type UseExhibitorsFiltersFromUrlReturn = {
  filters: ExhibitorsFilters;
  updateFilters: (next: Partial<ExhibitorsFilters>) => void;
};

export const useExhibitorsFiltersFromUrl = (): UseExhibitorsFiltersFromUrlReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { categorySlugs } = useParticipantCategories();

  const filters = useMemo(
    () => searchParamsToFilters(searchParams, categorySlugs),
    [searchParams, categorySlugs],
  );

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    const cleanupUrl = getExhibitorsUrlCleanupTarget(
      pathname,
      searchParams,
      filters,
      getExhibitorsVisibleCount(searchParams),
    );

    if (!cleanupUrl) return;

    router.replace(cleanupUrl, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  const updateFilters = useCallback(
    (next: Partial<ExhibitorsFilters>) => {
      const merged: ExhibitorsFilters = { ...filtersRef.current, ...next };
      const visibleCount = getExhibitorsVisibleCount(searchParams);
      const nextUrl = buildExhibitorsPageUrl(pathname, merged, visibleCount);
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { filters, updateFilters };
};
