import type { ExhibitorsQueryParams } from "@/lib/participants/exhibitor-types";
import {
  getListVisibleCount,
  LIST_VISIBLE_PARAM,
} from "@/lib/list-page-session-cache";
import { parseMapFilterType } from "@/lib/map/map-url";
import { parseExhibitorsQuery } from "@/lib/participants/exhibitors-query";
import {
  EXHIBITORS_PAGE_SIZE,
  type ExhibitorsFilters,
  type ExhibitorsFilterType,
} from "@/lib/participants/exhibitors-filters";
import { getValidFilterSlugs } from "@/lib/participants/participant-categories";
import { DEFAULT_PARTICIPANT_CATEGORIES } from "@/lib/participants/participant-categories";

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

const parseExhibitorsFilterType = (
  searchParams: URLSearchParams,
  validSlugs: string[]
): ExhibitorsFilterType => {
  const raw = searchParams.get("type");
  if (!raw) return "all";
  return parseMapFilterType(raw, validSlugs);
};

export const searchParamsToFilters = (
  searchParams: URLSearchParams,
  validSlugs: string[] = getValidFilterSlugs(DEFAULT_PARTICIPANT_CATEGORIES)
): ExhibitorsFilters => {
  const parsed = parseExhibitorsQuery(
    searchParams,
    validSlugs.length > 0
      ? validSlugs
      : getValidFilterSlugs(DEFAULT_PARTICIPANT_CATEGORIES)
  );

  return {
    type: parseExhibitorsFilterType(searchParams, validSlugs),
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

/** True when the URL still carries `type` but filters resolve to "all". */
export const shouldCleanExhibitorsTypeParam = (
  searchParams: URLSearchParams,
  filters: ExhibitorsFilters,
): boolean => filters.type === "all" && searchParams.has("type");

export const getExhibitorsUrlCleanupTarget = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: ExhibitorsFilters,
  visibleCount = getExhibitorsVisibleCount(searchParams),
): string | null => {
  if (!shouldCleanExhibitorsTypeParam(searchParams, filters)) {
    return null;
  }

  const cleanedUrl = buildExhibitorsPageUrl(pathname, filters, visibleCount);
  const currentQuery = searchParams.toString();
  const cleanedQuery = cleanedUrl.includes("?")
    ? cleanedUrl.slice(cleanedUrl.indexOf("?") + 1)
    : "";

  if (currentQuery === cleanedQuery) {
    return null;
  }

  return cleanedUrl;
};

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
