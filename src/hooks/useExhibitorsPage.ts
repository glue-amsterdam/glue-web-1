"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchExhibitorsPageClient } from "@/lib/client/fetch-exhibitors-page";
import type {
  ExhibitorItem,
  ExhibitorsPageResponse,
} from "@/lib/participants/exhibitor-types";
import {
  DEFAULT_EXHIBITORS_FILTERS,
  EXHIBITORS_PAGE_SIZE,
  type ExhibitorsFilters,
} from "@/lib/participants/exhibitors-filters";
import {
  applyExhibitorsFilters,
  paginateExhibitors,
} from "@/lib/participants/exhibitors-filter";
import {
  buildExhibitorsPageUrl,
  filtersToQueryParams,
  searchParamsToFilters,
} from "@/lib/participants/exhibitors-url";

type UseExhibitorsPageReturn = {
  items: ExhibitorItem[];
  total: number;
  hasMore: boolean;
  filters: ExhibitorsFilters;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  handleFiltersChange: (next: Partial<ExhibitorsFilters>) => void;
  handleLoadMore: () => void;
  handleRetry: () => void;
};

type ExhibitorsCatalog = {
  filtersKey: string;
  items: ExhibitorItem[];
  total: number;
  hasMore: boolean;
};

const areFiltersEqual = (
  left: ExhibitorsFilters,
  right: ExhibitorsFilters
): boolean => {
  return (
    left.type === right.type &&
    left.sort === right.sort &&
    left.order === right.order &&
    left.q === right.q
  );
};

const getBaseFiltersKey = (filters: ExhibitorsFilters): string =>
  `${filters.type}|${filters.sort}|${filters.order}`;

const isCatalogComplete = (catalog: ExhibitorsCatalog): boolean =>
  !catalog.hasMore && catalog.items.length >= catalog.total;

const getLocalPage = (
  catalog: ExhibitorsCatalog,
  filters: ExhibitorsFilters,
  offset: number
) => {
  const filteredItems = applyExhibitorsFilters(catalog.items, filters);
  return paginateExhibitors(filteredItems, offset, EXHIBITORS_PAGE_SIZE);
};

const createInitialCatalog = (
  initialFilters: ExhibitorsFilters,
  initialData: ExhibitorsPageResponse
): ExhibitorsCatalog | null => {
  if (initialFilters.q.trim()) return null;

  return {
    filtersKey: getBaseFiltersKey(initialFilters),
    items: initialData.items,
    total: initialData.total,
    hasMore: initialData.hasMore,
  };
};

export const useExhibitorsPage = (
  initialData: ExhibitorsPageResponse,
  initialFilters: ExhibitorsFilters = DEFAULT_EXHIBITORS_FILTERS
): UseExhibitorsPageReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ExhibitorItem[]>(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [filters, setFilters] = useState<ExhibitorsFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipInitialFiltersEffectRef = useRef(true);
  const filtersSourceRef = useRef<"url" | "internal">("url");
  const requestIdRef = useRef(0);
  const catalogRef = useRef<ExhibitorsCatalog | null>(
    createInitialCatalog(initialFilters, initialData)
  );

  const syncUrl = useCallback(
    (nextFilters: ExhibitorsFilters) => {
      const nextUrl = buildExhibitorsPageUrl(pathname, nextFilters);
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router]
  );

  const updateCatalog = useCallback(
    (
      nextFilters: ExhibitorsFilters,
      data: ExhibitorsPageResponse,
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
    (nextFilters: ExhibitorsFilters, offset: number) => {
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
      nextFilters: ExhibitorsFilters,
      offset: number,
      append: boolean,
      shouldSyncUrl: boolean,
      options?: { silent?: boolean }
    ) => {
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
        const data = await fetchExhibitorsPageClient(
          filtersToQueryParams(nextFilters, offset)
        );

        if (requestId !== requestIdRef.current) return;

        updateCatalog(nextFilters, data, append);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setItems((currentItems) =>
          append ? [...currentItems, ...data.items] : data.items
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        const message =
          err instanceof Error ? err.message : "Error loading exhibitors";
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

  const handleFiltersChange = useCallback((next: Partial<ExhibitorsFilters>) => {
    filtersSourceRef.current = "internal";
    setFilters((currentFilters) => ({ ...currentFilters, ...next }));
  }, []);

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
    fetchPage(filters, 0, false, false);
  }, [fetchPage, filters]);

  useEffect(() => {
    if (skipInitialFiltersEffectRef.current) {
      skipInitialFiltersEffectRef.current = false;
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
    const filtersFromUrl = searchParamsToFilters(searchParams);

    setFilters((currentFilters) => {
      if (areFiltersEqual(currentFilters, filtersFromUrl)) {
        return currentFilters;
      }

      const baseFiltersChanged =
        getBaseFiltersKey(currentFilters) !== getBaseFiltersKey(filtersFromUrl);

      if (baseFiltersChanged) {
        catalogRef.current = null;
      }

      filtersSourceRef.current = "url";
      return filtersFromUrl;
    });
  }, [searchParams]);

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
