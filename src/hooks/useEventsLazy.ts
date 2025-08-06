import { useState, useEffect, useCallback, useRef } from "react";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import { fetchEventsClient } from "@/utils/api";

interface UseEventsLazyReturn {
  events: IndividualEventResponse[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
  retry: () => void;
  totalEvents: number;
}

export const useEventsLazy = (
  searchParams: URLSearchParams,
  itemsPerPage: number = 12
): UseEventsLazyReturn => {
  const [events, setEvents] = useState<IndividualEventResponse[]>([]);
  const [allEvents, setAllEvents] = useState<IndividualEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate hasMore
  const hasMore = currentPage * itemsPerPage < allEvents.length;

  const loadInitialEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Add pagination parameters to search params
      const paramsWithPagination = new URLSearchParams(searchParams);
      paramsWithPagination.set("limit", "1000"); // Get all events for filtering

      const allData = await fetchEventsClient(paramsWithPagination);

      if (abortControllerRef.current.signal.aborted) return;

      setAllEvents(allData);
      setTotalEvents(allData.length);

      // Load first page
      const firstPage = allData.slice(0, itemsPerPage);
      setEvents(firstPage);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError("Error loading events");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  // Load all events initially when search params change
  useEffect(() => {
    setEvents([]);
    setCurrentPage(0);
    setAllEvents([]);
    setTotalEvents(0);
    loadInitialEvents();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadInitialEvents]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    // Simulate a small delay to show loading
    setTimeout(() => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newEvents = allEvents.slice(startIndex, endIndex);

      setEvents((prev) => [...prev, ...newEvents]);
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, currentPage, itemsPerPage, allEvents, hasMore]);

  const retry = useCallback(() => {
    setError(null);
    setCurrentPage(0);
    setEvents([]);
    setAllEvents([]);
    setTotalEvents(0);
    loadInitialEvents();
  }, [loadInitialEvents]);

  return {
    events,
    loading: loading || loadingMore,
    hasMore,
    loadMore,
    error,
    retry,
    totalEvents,
  };
};
