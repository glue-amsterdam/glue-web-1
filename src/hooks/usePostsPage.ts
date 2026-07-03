"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchPostsPageClient } from "@/lib/client/fetch-posts-page";
import {
  areClientSearchParamsReady,
  clearListSnapshot,
  readListSnapshot,
  replaceListVisibleCountInUrl,
  saveListSnapshot,
  type ListPageCatalogSnapshot,
} from "@/lib/list-page-session-cache";
import { POSTS_PAGE_SIZE } from "@/lib/posts/posts-filters";
import type { PostsPageResponse } from "@/lib/posts/posts-types";
import {
  buildPostsPageQueryParams,
  getPostsVisibleCount,
} from "@/lib/posts/posts-url";
import type { PublicPostSummary } from "@/schemas/postSchema";

const POSTS_LIST_ROUTE = "/posts";
const POSTS_FILTERS_KEY = "_default";

type UsePostsPageReturn = {
  items: PublicPostSummary[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  handleLoadMore: () => void;
  handleRetry: () => void;
};

type PostsCatalog = {
  items: PublicPostSummary[];
  total: number;
  hasMore: boolean;
};

type ResolvedPostsState = {
  items: PublicPostSummary[];
  total: number;
  hasMore: boolean;
  catalog: PostsCatalog | null;
};

const isCatalogComplete = (catalog: PostsCatalog): boolean =>
  !catalog.hasMore && catalog.items.length >= catalog.total;

const createInitialCatalog = (
  initialData: PostsPageResponse,
): PostsCatalog => ({
  items: initialData.items,
  total: initialData.total,
  hasMore: initialData.hasMore,
});

const resolveInitialPostsState = (
  initialData: PostsPageResponse,
): ResolvedPostsState => ({
  items: initialData.items,
  total: initialData.total,
  hasMore: initialData.hasMore,
  catalog: createInitialCatalog(initialData),
});

export const usePostsPage = (
  initialData: PostsPageResponse,
): UsePostsPageReturn => {
  const searchParams = useSearchParams();

  const initialStateRef = useRef<ResolvedPostsState | null>(null);
  if (initialStateRef.current === null) {
    initialStateRef.current = resolveInitialPostsState(initialData);
  }
  const initialState = initialStateRef.current;

  const [items, setItems] = useState<PublicPostSummary[]>(initialState.items);
  const [total, setTotal] = useState(initialState.total);
  const [hasMore, setHasMore] = useState(initialState.hasMore);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suppressFetchRef = useRef(false);
  const requestIdRef = useRef(0);
  const catalogRef = useRef<PostsCatalog | null>(initialState.catalog);
  const visibleCountRef = useRef(getPostsVisibleCount(searchParams));

  const listStateRef = useRef({
    items: initialState.items,
    total: initialState.total,
    hasMore: initialState.hasMore,
    catalog: initialState.catalog,
    visibleCount: visibleCountRef.current,
  });

  useEffect(() => {
    listStateRef.current = {
      items,
      total,
      hasMore,
      catalog: catalogRef.current,
      visibleCount: visibleCountRef.current,
    };
  }, [items, total, hasMore]);

  useEffect(() => {
    return () => {
      const state = listStateRef.current;
      const catalogSnapshot: ListPageCatalogSnapshot | null = state.catalog
        ? {
            filtersKey: POSTS_FILTERS_KEY,
            items: state.catalog.items,
            total: state.catalog.total,
            hasMore: state.catalog.hasMore,
          }
        : null;

      saveListSnapshot(POSTS_LIST_ROUTE, POSTS_FILTERS_KEY, {
        items: state.items,
        total: state.total,
        hasMore: state.hasMore,
        filters: null,
        catalog: catalogSnapshot,
        visibleCount: state.visibleCount,
      });
    };
  }, []);

  const updateCatalog = useCallback(
    (data: PostsPageResponse, append: boolean) => {
      const currentCatalog = catalogRef.current;

      if (!append || !currentCatalog) {
        catalogRef.current = {
          items: data.items,
          total: data.total,
          hasMore: data.hasMore,
        };
        return;
      }

      catalogRef.current = {
        items: [...currentCatalog.items, ...data.items],
        total: data.total,
        hasMore: data.hasMore,
      };
    },
    [],
  );

  const fetchPage = useCallback(
    async (
      offset: number,
      append: boolean,
      options?: {
        silent?: boolean;
        preserveOnError?: boolean;
        limit?: number;
        nextVisibleCount?: number;
      },
    ) => {
      const limit = options?.limit ?? POSTS_PAGE_SIZE;

      if (!append && offset === 0 && suppressFetchRef.current) {
        return;
      }

      const requestId = ++requestIdRef.current;
      const silent = options?.silent ?? false;
      const preserveOnError = options?.preserveOnError ?? false;

      if (append) {
        setLoadingMore(true);
      } else if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const data = await fetchPostsPageClient({
          ...buildPostsPageQueryParams(offset),
          limit,
        });

        if (requestId !== requestIdRef.current) return;

        suppressFetchRef.current = false;
        updateCatalog(data, append);

        if (options?.nextVisibleCount) {
          visibleCountRef.current = options.nextVisibleCount;
          replaceListVisibleCountInUrl(
            options.nextVisibleCount,
            POSTS_PAGE_SIZE,
          );
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
        setItems((currentItems) =>
          append ? [...currentItems, ...data.items] : data.items,
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        if (preserveOnError && listStateRef.current.items.length > 0) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Error loading posts";
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
    [updateCatalog],
  );

  const sessionRestoreDoneRef = useRef(false);

  useEffect(() => {
    if (sessionRestoreDoneRef.current) return;
    sessionRestoreDoneRef.current = true;

    const requestedVisibleCount = visibleCountRef.current;
    const snapshot = readListSnapshot<null>(
      POSTS_LIST_ROUTE,
      POSTS_FILTERS_KEY,
      () => true,
      null,
      requestedVisibleCount,
    );

    if (!snapshot) {
      if (requestedVisibleCount > POSTS_PAGE_SIZE) {
        void fetchPage(0, false, {
          limit: requestedVisibleCount,
          preserveOnError: true,
        });
      }
      return;
    }

    suppressFetchRef.current = true;
    catalogRef.current = snapshot.catalog as PostsCatalog | null;
    const restoredItems = (snapshot.items as PublicPostSummary[]).slice(
      0,
      requestedVisibleCount,
    );
    setItems(restoredItems);
    setTotal(snapshot.total);
    setHasMore(restoredItems.length < snapshot.total);

    void fetchPage(0, false, {
      silent: true,
      preserveOnError: true,
      limit: requestedVisibleCount,
    });
  }, [fetchPage]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    const catalog = catalogRef.current;
    if (catalog && isCatalogComplete(catalog)) {
      const nextItems = catalog.items.slice(
        items.length,
        items.length + POSTS_PAGE_SIZE,
      );
      if (nextItems.length === 0) return;

      const nextVisibleCount = items.length + nextItems.length;
      visibleCountRef.current = nextVisibleCount;
      replaceListVisibleCountInUrl(nextVisibleCount, POSTS_PAGE_SIZE);
      setItems((currentItems) => [...currentItems, ...nextItems]);
      setHasMore(nextVisibleCount < catalog.total);
      return;
    }

    const nextVisibleCount = items.length + POSTS_PAGE_SIZE;
    fetchPage(items.length, true, {
      nextVisibleCount,
    });
  }, [fetchPage, hasMore, items.length, loading, loadingMore]);

  const handleRetry = useCallback(() => {
    suppressFetchRef.current = false;
    fetchPage(0, false);
  }, [fetchPage]);

  useEffect(() => {
    if (!areClientSearchParamsReady(searchParams, POSTS_FILTERS_KEY)) {
      return;
    }

    const nextVisibleCount = getPostsVisibleCount(searchParams);
    if (nextVisibleCount === visibleCountRef.current) {
      return;
    }

    visibleCountRef.current = nextVisibleCount;
    clearListSnapshot(POSTS_LIST_ROUTE, POSTS_FILTERS_KEY);
    suppressFetchRef.current = false;

    void fetchPage(0, false, {
      limit: nextVisibleCount,
      preserveOnError: true,
    });
  }, [fetchPage, searchParams]);

  return {
    items,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    handleLoadMore,
    handleRetry,
  };
};
