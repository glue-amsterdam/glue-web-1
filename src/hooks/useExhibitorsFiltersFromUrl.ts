"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ExhibitorsFilters } from "@/lib/participants/exhibitors-filters";
import {
  buildExhibitorsPageUrl,
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

  const filters = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  );

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

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
