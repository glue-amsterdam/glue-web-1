import type { ProgramQueryParams } from "./program-types";
import { parseProgramQuery } from "./program-query";
import {
  PROGRAM_PAGE_SIZE,
  type ProgramFilters,
} from "./program-filters";

export const buildProgramSearchParams = (
  params: ProgramQueryParams
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  searchParams.set("limit", String(params.limit ?? PROGRAM_PAGE_SIZE));
  searchParams.set("offset", String(params.offset ?? 0));

  if (params.type) {
    searchParams.set("type", params.type);
  }
  if (params.day) {
    searchParams.set("day", params.day);
  }
  if (params.q) {
    searchParams.set("q", params.q);
  }

  return searchParams;
};

export const filtersToQueryParams = (
  filters: ProgramFilters,
  offset = 0
): ProgramQueryParams => ({
  limit: PROGRAM_PAGE_SIZE,
  offset,
  type: filters.type === "all" ? undefined : filters.type,
  day: filters.day === "all" ? undefined : filters.day,
  q: filters.q.trim() || undefined,
});

export const searchParamsToFilters = (
  searchParams: URLSearchParams
): ProgramFilters => {
  const parsed = parseProgramQuery(searchParams);

  return {
    type: parsed.type ?? "all",
    day: parsed.day ?? "all",
    q: parsed.q ?? "",
  };
};

export const buildProgramPageUrl = (
  pathname: string,
  filters: ProgramFilters
): string => {
  const searchParams = new URLSearchParams();

  if (filters.type !== "all") {
    searchParams.set("type", filters.type);
  }
  if (filters.day !== "all") {
    searchParams.set("day", filters.day);
  }
  if (filters.q.trim()) {
    searchParams.set("q", filters.q.trim());
  }

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export const recordToSearchParams = (
  params: Record<string, string | string[] | undefined>
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
};
