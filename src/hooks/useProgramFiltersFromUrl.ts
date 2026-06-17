"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProgramFilters } from "@/lib/program/program-filters";
import {
  buildProgramPageUrl,
  searchParamsToFilters,
} from "@/lib/program/program-url";

type UseProgramFiltersFromUrlReturn = {
  filters: ProgramFilters;
  updateFilters: (next: Partial<ProgramFilters>) => void;
};

export const useProgramFiltersFromUrl = (): UseProgramFiltersFromUrlReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams]
  );

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const updateFilters = useCallback(
    (next: Partial<ProgramFilters>) => {
      const merged: ProgramFilters = { ...filtersRef.current, ...next };
      const nextUrl = buildProgramPageUrl(pathname, merged);
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router]
  );

  return { filters, updateFilters };
};
