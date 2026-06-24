const CACHE_PREFIX = "glue:list:";
const TTL_MS = 15 * 60 * 1000;
export const LIST_VISIBLE_PARAM = "visible";
const MAX_VISIBLE_PAGES = 10;

export type ListPageCatalogSnapshot = {
  filtersKey: string;
  items: unknown[];
  total: number;
  hasMore: boolean;
};

export type ListPageSnapshot<TFilters> = {
  items: unknown[];
  total: number;
  hasMore: boolean;
  filters: TFilters;
  catalog: ListPageCatalogSnapshot | null;
  visibleCount: number;
  savedAt: number;
};

type StoredPayload<TFilters> = ListPageSnapshot<TFilters>;

const getStorageKey = (route: string, filtersKey: string): string =>
  `${CACHE_PREFIX}${route}:${filtersKey}`;

export const filtersKeyFromPageUrl = (pageUrl: string): string => {
  const queryIndex = pageUrl.indexOf("?");
  if (queryIndex === -1) return "_default";
  return pageUrl.slice(queryIndex + 1);
};

export const getClientSearchParamsString = (): string => {
  if (typeof window === "undefined") return "";
  const search = window.location.search;
  return search.startsWith("?") ? search.slice(1) : search;
};

export const normalizeListVisibleCount = (
  visibleCount: number,
  pageSize: number,
): number => {
  if (!Number.isFinite(visibleCount) || visibleCount <= pageSize) {
    return pageSize;
  }

  const maxVisibleCount = pageSize * MAX_VISIBLE_PAGES;
  const roundedCount = Math.ceil(visibleCount / pageSize) * pageSize;
  return Math.min(roundedCount, maxVisibleCount);
};

export const getListVisibleCount = (
  searchParams: URLSearchParams,
  pageSize: number,
): number => {
  const rawVisibleCount = searchParams.get(LIST_VISIBLE_PARAM);
  if (!rawVisibleCount) return pageSize;

  return normalizeListVisibleCount(Number(rawVisibleCount), pageSize);
};

export const replaceListVisibleCountInUrl = (
  visibleCount: number,
  pageSize: number,
): void => {
  if (typeof window === "undefined") return;

  const normalizedVisibleCount = normalizeListVisibleCount(
    visibleCount,
    pageSize,
  );
  const url = new URL(window.location.href);

  if (normalizedVisibleCount <= pageSize) {
    url.searchParams.delete(LIST_VISIBLE_PARAM);
  } else {
    url.searchParams.set(LIST_VISIBLE_PARAM, String(normalizedVisibleCount));
  }

  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
};

/** Avoid syncing useSearchParams → filters while the hook still lags behind the real URL. */
export const areClientSearchParamsReady = (
  searchParams: URLSearchParams,
  expectedFiltersKey: string,
): boolean => {
  if (typeof window === "undefined") return true;

  const hookQuery = searchParams.toString();
  const locationQuery = getClientSearchParamsString();

  if (locationQuery === hookQuery) return true;

  if (locationQuery.length > 0 && hookQuery.length === 0) return false;

  if (
    expectedFiltersKey !== "_default" &&
    locationQuery === expectedFiltersKey &&
    hookQuery !== expectedFiltersKey
  ) {
    return false;
  }

  return hookQuery === locationQuery;
};

const isExpired = (savedAt: number): boolean => Date.now() - savedAt > TTL_MS;

export const saveListSnapshot = <TFilters>(
  route: string,
  filtersKey: string,
  snapshot: {
    items: unknown[];
    total: number;
    hasMore: boolean;
    filters: TFilters;
    catalog: ListPageCatalogSnapshot | null;
    visibleCount: number;
  },
): void => {
  if (typeof window === "undefined") return;

  try {
    const payload: StoredPayload<TFilters> = {
      ...snapshot,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(
      getStorageKey(route, filtersKey),
      JSON.stringify(payload),
    );
  } catch {
    // sessionStorage full or unavailable
  }
};

export const readListSnapshot = <TFilters>(
  route: string,
  filtersKey: string,
  areFiltersEqual: (left: TFilters, right: TFilters) => boolean,
  currentFilters: TFilters,
  requestedVisibleCount?: number,
): ListPageSnapshot<TFilters> | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(getStorageKey(route, filtersKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredPayload<TFilters>;
    if (!parsed || isExpired(parsed.savedAt)) {
      sessionStorage.removeItem(getStorageKey(route, filtersKey));
      return null;
    }

    if (!areFiltersEqual(parsed.filters, currentFilters)) {
      return null;
    }

    if (requestedVisibleCount) {
      const availableCount = Math.min(parsed.items.length, parsed.total);
      const requiredCount = Math.min(requestedVisibleCount, parsed.total);

      if (availableCount < requiredCount) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearListSnapshot = (route: string, filtersKey?: string): void => {
  if (typeof window === "undefined") return;

  try {
    if (filtersKey) {
      sessionStorage.removeItem(getStorageKey(route, filtersKey));
      return;
    }

    const prefix = `${CACHE_PREFIX}${route}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
};
