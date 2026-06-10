"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchProgramPageClient } from "@/lib/client/fetch-program-page";
import {
  areClientSearchParamsReady,
  clearListSnapshot,
  filtersKeyFromPageUrl,
  readListSnapshot,
  saveListSnapshot,
  type ListPageCatalogSnapshot,
} from "@/lib/list-page-session-cache";
import {
  applyProgramFilters,
  paginateProgram,
} from "@/lib/program/program-filter";
import {
  DEFAULT_PROGRAM_FILTERS,
  PROGRAM_PAGE_SIZE,
  type ProgramFilters,
} from "@/lib/program/program-filters";
import type {
  ProgramListItem,
  ProgramPageResponse,
} from "@/lib/program/program-types";
import {
  buildProgramPageUrl,
  filtersToQueryParams,
  searchParamsToFilters,
} from "@/lib/program/program-url";

const PROGRAM_LIST_ROUTE = "/program";

type UseProgramPageReturn = {
  items: ProgramListItem[];
  total: number;
  hasMore: boolean;
  filters: ProgramFilters;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  handleFiltersChange: (next: Partial<ProgramFilters>) => void;
  handleLoadMore: () => void;
  handleRetry: () => void;
};

type ProgramCatalog = {
  filtersKey: string;
  items: ProgramListItem[];
  total: number;
  hasMore: boolean;
};

type ResolvedProgramState = {
  items: ProgramListItem[];
  total: number;
  hasMore: boolean;
  filters: ProgramFilters;
  catalog: ProgramCatalog | null;
  suppressFetchKey: string | null;
};

const areFiltersEqual = (left: ProgramFilters, right: ProgramFilters): boolean =>
  left.type === right.type && left.day === right.day && left.q === right.q;

const getBaseFiltersKey = (filters: ProgramFilters): string =>
  `${filters.type}|${filters.day}`;

const getProgramFiltersCacheKey = (filters: ProgramFilters): string =>
  filtersKeyFromPageUrl(buildProgramPageUrl(PROGRAM_LIST_ROUTE, filters));

const isCatalogComplete = (catalog: ProgramCatalog): boolean =>
  !catalog.hasMore && catalog.items.length >= catalog.total;

const getLocalPage = (
  catalog: ProgramCatalog,
  filters: ProgramFilters,
  offset: number
) => {
  const filteredItems = applyProgramFilters(catalog.items, filters);
  return paginateProgram(filteredItems, offset, PROGRAM_PAGE_SIZE);
};

const createInitialCatalog = (
  initialFilters: ProgramFilters,
  initialData: ProgramPageResponse
): ProgramCatalog | null => {
  if (initialFilters.q.trim()) return null;

  return {
    filtersKey: getBaseFiltersKey(initialFilters),
    items: initialData.items,
    total: initialData.total,
    hasMore: initialData.hasMore,
  };
};

const resolveInitialProgramState = (
  initialData: ProgramPageResponse,
  initialFilters: ProgramFilters
): ResolvedProgramState => {
  const defaults: ResolvedProgramState = {
    items: initialData.items,
    total: initialData.total,
    hasMore: initialData.hasMore,
    filters: initialFilters,
    catalog: createInitialCatalog(initialFilters, initialData),
    suppressFetchKey: null,
  };

  if (typeof window === "undefined") return defaults;

  const filtersKey = getProgramFiltersCacheKey(initialFilters);
  const snapshot = readListSnapshot<ProgramFilters>(
    PROGRAM_LIST_ROUTE,
    filtersKey,
    areFiltersEqual,
    initialFilters
  );

  if (!snapshot) return defaults;

  return {
    items: snapshot.items as ProgramListItem[],
    total: snapshot.total,
    hasMore: snapshot.hasMore,
    filters: snapshot.filters,
    catalog: snapshot.catalog as ProgramCatalog | null,
    suppressFetchKey: filtersKey,
  };
};

export const useProgramPage = (
  initialData: ProgramPageResponse,
  initialFilters: ProgramFilters = DEFAULT_PROGRAM_FILTERS
): UseProgramPageReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialStateRef = useRef<ResolvedProgramState | null>(null);
  if (initialStateRef.current === null) {
    initialStateRef.current = resolveInitialProgramState(
      initialData,
      initialFilters
    );
  }
  const initialState = initialStateRef.current;

  const [items, setItems] = useState<ProgramListItem[]>(initialState.items);
  const [total, setTotal] = useState(initialState.total);
  const [hasMore, setHasMore] = useState(initialState.hasMore);
  const [filters, setFilters] = useState<ProgramFilters>(initialState.filters);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipInitialFiltersEffectRef = useRef(true);
  const suppressFetchForFiltersKeyRef = useRef<string | null>(
    initialState.suppressFetchKey
  );
  const filtersSourceRef = useRef<"url" | "internal">("url");
  const requestIdRef = useRef(0);
  const catalogRef = useRef<ProgramCatalog | null>(initialState.catalog);

  const listStateRef = useRef({
    items: initialState.items,
    total: initialState.total,
    hasMore: initialState.hasMore,
    filters: initialState.filters,
    catalog: initialState.catalog,
  });

  const clearSuppressFetch = useCallback(() => {
    suppressFetchForFiltersKeyRef.current = null;
  }, []);

  useEffect(() => {
    listStateRef.current = {
      items,
      total,
      hasMore,
      filters,
      catalog: catalogRef.current,
    };
  }, [items, total, hasMore, filters]);

  useEffect(() => {
    return () => {
      const state = listStateRef.current;
      const filtersKey = getProgramFiltersCacheKey(state.filters);
      const catalogSnapshot: ListPageCatalogSnapshot | null = state.catalog
        ? {
            filtersKey: state.catalog.filtersKey,
            items: state.catalog.items,
            total: state.catalog.total,
            hasMore: state.catalog.hasMore,
          }
        : null;

      saveListSnapshot(PROGRAM_LIST_ROUTE, filtersKey, {
        items: state.items,
        total: state.total,
        hasMore: state.hasMore,
        filters: state.filters,
        catalog: catalogSnapshot,
      });
    };
  }, []);

  const syncUrl = useCallback(
    (nextFilters: ProgramFilters) => {
      const nextUrl = buildProgramPageUrl(pathname, nextFilters);
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router]
  );

  const updateCatalog = useCallback(
    (
      nextFilters: ProgramFilters,
      data: ProgramPageResponse,
      append: boolean
    ) => {
      if (nextFilters.q.trim()) return;

      const filtersKey = getBaseFiltersKey(nextFilters);
      const currentCatalog = catalogRef.current;

      if (!append || !currentCatalog || currentCatalog.filtersKey !== filtersKey) {
        catalogRef.current = {
          filtersKey,
          items: data.items,
          total: data.total,
          hasMore: data.hasMore,
        };
        return;
      }

      catalogRef.current = {
        filtersKey,
        items: [...currentCatalog.items, ...data.items],
        total: data.total,
        hasMore: data.hasMore,
      };
    },
    []
  );

  const applyLocalPage = useCallback(
    (nextFilters: ProgramFilters, offset: number) => {
      const catalog = catalogRef.current;
      if (!catalog || catalog.filtersKey !== getBaseFiltersKey(nextFilters)) {
        return null;
      }

      const localPage = getLocalPage(catalog, nextFilters, offset);
      setItems(localPage.pageItems);
      setTotal(localPage.total);
      setHasMore(localPage.hasMore);

      return {
        canSkipFetch: isCatalogComplete(catalog),
      };
    },
    []
  );

  const fetchPage = useCallback(
    async (
      nextFilters: ProgramFilters,
      offset: number,
      append: boolean,
      shouldSyncUrl: boolean,
      options?: { silent?: boolean }
    ) => {
      const cacheKey = getProgramFiltersCacheKey(nextFilters);

      if (!append && offset === 0) {
        const cached = readListSnapshot<ProgramFilters>(
          PROGRAM_LIST_ROUTE,
          cacheKey,
          areFiltersEqual,
          nextFilters
        );
        if (
          cached &&
          suppressFetchForFiltersKeyRef.current === cacheKey
        ) {
          return;
        }
      }

      const requestId = ++requestIdRef.current;
      const silent = options?.silent ?? false;

      if (append) {
        setLoadingMore(true);
      } else if (!silent) {
        setLoading(true);
      }

      setError(null);

      if (shouldSyncUrl && !append) {
        syncUrl(nextFilters);
      }

      try {
        const data = await fetchProgramPageClient(
          filtersToQueryParams(nextFilters, offset)
        );

        if (requestId !== requestIdRef.current) return;

        suppressFetchForFiltersKeyRef.current = null;
        updateCatalog(nextFilters, data, append);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setItems((currentItems) =>
          append ? [...currentItems, ...data.items] : data.items
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        const message =
          err instanceof Error ? err.message : "Error loading program events";
        setError(message);
      } finally {
        if (requestId !== requestIdRef.current) return;

        if (append) {
          setLoadingMore(false);
        } else if (!silent) {
          setLoading(false);
        }
      }
    },
    [syncUrl, updateCatalog]
  );

  const hadSessionSnapshotRef = useRef(initialState.suppressFetchKey !== null);

  useEffect(() => {
    if (!hadSessionSnapshotRef.current) return;

    clearSuppressFetch();
    void fetchPage(initialState.filters, 0, false, false, { silent: true });
  }, [clearSuppressFetch, fetchPage, initialState.filters]);

  const handleFiltersChange = useCallback(
    (next: Partial<ProgramFilters>) => {
      clearSuppressFetch();
      filtersSourceRef.current = "internal";
      setFilters((currentFilters) => ({ ...currentFilters, ...next }));
    },
    [clearSuppressFetch]
  );

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    const catalog = catalogRef.current;
    if (
      catalog &&
      catalog.filtersKey === getBaseFiltersKey(filters) &&
      isCatalogComplete(catalog)
    ) {
      const localPage = getLocalPage(catalog, filters, items.length);
      if (localPage.pageItems.length === 0) return;

      setItems((currentItems) => [...currentItems, ...localPage.pageItems]);
      setHasMore(localPage.hasMore);
      return;
    }

    fetchPage(filters, items.length, true, false);
  }, [fetchPage, filters, hasMore, items.length, loading, loadingMore]);

  const handleRetry = useCallback(() => {
    clearSuppressFetch();
    fetchPage(filters, 0, false, false);
  }, [clearSuppressFetch, fetchPage, filters]);

  useEffect(() => {
    if (skipInitialFiltersEffectRef.current) {
      skipInitialFiltersEffectRef.current = false;
      return;
    }

    const cacheKey = getProgramFiltersCacheKey(filters);
    if (suppressFetchForFiltersKeyRef.current === cacheKey) {
      return;
    }

    const shouldSyncUrl = filtersSourceRef.current === "internal";
    const localResult = applyLocalPage(filters, 0);

    if (localResult?.canSkipFetch) {
      return;
    }

    fetchPage(filters, 0, false, shouldSyncUrl, {
      silent: localResult !== null,
    });
  }, [applyLocalPage, fetchPage, filters]);

  useEffect(() => {
    const expectedKey = getProgramFiltersCacheKey(initialFilters);
    if (!areClientSearchParamsReady(searchParams, expectedKey)) {
      return;
    }

    const filtersFromUrl = searchParamsToFilters(searchParams);

    setFilters((currentFilters) => {
      if (areFiltersEqual(currentFilters, filtersFromUrl)) {
        return currentFilters;
      }

      const baseFiltersChanged =
        getBaseFiltersKey(currentFilters) !== getBaseFiltersKey(filtersFromUrl);

      if (baseFiltersChanged) {
        catalogRef.current = null;
        clearListSnapshot(PROGRAM_LIST_ROUTE);
      } else {
        clearListSnapshot(
          PROGRAM_LIST_ROUTE,
          getProgramFiltersCacheKey(currentFilters)
        );
      }

      clearSuppressFetch();
      filtersSourceRef.current = "url";
      return filtersFromUrl;
    });
  }, [clearSuppressFetch, initialFilters, searchParams]);

  return {
    items,
    total,
    hasMore,
    filters,
    loading,
    loadingMore,
    error,
    handleFiltersChange,
    handleLoadMore,
    handleRetry,
  };
};
