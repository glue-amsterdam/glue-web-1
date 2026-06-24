import type { ExhibitorsQueryParams } from "@/lib/participants/exhibitor-types";
import {
  getListVisibleCount,
  LIST_VISIBLE_PARAM,
} from "@/lib/list-page-session-cache";
import { parseExhibitorsQuery } from "@/lib/participants/exhibitors-query";
import {
  EXHIBITORS_PAGE_SIZE,
  type ExhibitorsFilters,
} from "@/lib/participants/exhibitors-filters";

export const buildExhibitorsSearchParams = (
  params: ExhibitorsQueryParams,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  searchParams.set("limit", String(params.limit ?? EXHIBITORS_PAGE_SIZE));
  searchParams.set("offset", String(params.offset ?? 0));

  if (params.type) {
    searchParams.set("type", params.type);
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.order) {
    searchParams.set("order", params.order);
  }
  if (params.q) {
    searchParams.set("q", params.q);
  }

  return searchParams;
};

export const filtersToQueryParams = (
  filters: ExhibitorsFilters,
  offset = 0,
): ExhibitorsQueryParams => ({
  limit: EXHIBITORS_PAGE_SIZE,
  offset,
  type: filters.type === "all" ? undefined : filters.type,
  sort: filters.sort,
  order: filters.order,
  q: filters.q.trim() || undefined,
});

export const searchParamsToFilters = (
  searchParams: URLSearchParams,
): ExhibitorsFilters => {
  const parsed = parseExhibitorsQuery(searchParams);

  return {
    type: parsed.type ?? "all",
    sort: parsed.sort,
    order: parsed.order,
    q: parsed.q ?? "",
  };
};

export const buildExhibitorsPageUrl = (
  pathname: string,
  filters: ExhibitorsFilters,
  visibleCount = EXHIBITORS_PAGE_SIZE,
): string => {
  const searchParams = new URLSearchParams();

  if (filters.type !== "all") {
    searchParams.set("type", filters.type);
  }
  if (filters.sort !== "displayNumber") {
    searchParams.set("sort", filters.sort);
  }
  if (filters.order !== "asc") {
    searchParams.set("order", filters.order);
  }
  if (filters.q.trim()) {
    searchParams.set("q", filters.q.trim());
  }
  if (visibleCount > EXHIBITORS_PAGE_SIZE) {
    searchParams.set(LIST_VISIBLE_PARAM, String(visibleCount));
  }

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export const getExhibitorsVisibleCount = (
  searchParams: URLSearchParams,
): number => getListVisibleCount(searchParams, EXHIBITORS_PAGE_SIZE);

export const recordToSearchParams = (
  params: Record<string, string | string[] | undefined>,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
};
