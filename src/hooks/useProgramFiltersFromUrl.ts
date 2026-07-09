"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import type { ProgramFilters } from "@/lib/program/program-filters";
import { PROGRAM_PAGE_SIZE } from "@/lib/program/program-filters";
import { useListPageSearchParams } from "@/hooks/useListPageSearchParams";
import { replaceListPageUrl } from "@/lib/list-page-session-cache";
import {
  buildProgramPageUrl,
  getProgramVisibleCount,
  searchParamsToFilters,
} from "@/lib/program/program-url";

type UseProgramFiltersFromUrlReturn = {
  filters: ProgramFilters;
  updateFilters: (next: Partial<ProgramFilters>) => void;
};

export const useProgramFiltersFromUrl = (): UseProgramFiltersFromUrlReturn => {
  const pathname = usePathname();
  const searchParams = useListPageSearchParams();

  const filters = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  );

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const updateFilters = useCallback(
    (next: Partial<ProgramFilters>) => {
      const merged: ProgramFilters = { ...filtersRef.current, ...next };
      const resetsVisibleCount =
        "type" in next || "day" in next || "q" in next;
      const visibleCount = resetsVisibleCount
        ? PROGRAM_PAGE_SIZE
        : getProgramVisibleCount(searchParams);
      const nextUrl = buildProgramPageUrl(pathname, merged, visibleCount);
      replaceListPageUrl(nextUrl);
    },
    [pathname, searchParams],
  );

  return { filters, updateFilters };
};
