"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import type { ExhibitorsFilters } from "@/lib/participants/exhibitors-filters";
import { EXHIBITORS_PAGE_SIZE } from "@/lib/participants/exhibitors-filters";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import { useListPageSearchParams } from "@/hooks/useListPageSearchParams";
import { replaceListPageUrl } from "@/lib/list-page-session-cache";
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
  const pathname = usePathname();
  const searchParams = useListPageSearchParams();

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

    replaceListPageUrl(cleanupUrl);
  }, [filters, pathname, searchParams]);

  const updateFilters = useCallback(
    (next: Partial<ExhibitorsFilters>) => {
      const merged: ExhibitorsFilters = { ...filtersRef.current, ...next };
      const resetsVisibleCount =
        "type" in next || "sort" in next || "order" in next || "q" in next;
      const visibleCount = resetsVisibleCount
        ? EXHIBITORS_PAGE_SIZE
        : getExhibitorsVisibleCount(searchParams);
      const nextUrl = buildExhibitorsPageUrl(pathname, merged, visibleCount);
      replaceListPageUrl(nextUrl);
    },
    [pathname, searchParams],
  );

  return { filters, updateFilters };
};
