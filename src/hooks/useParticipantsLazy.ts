import { useState, useEffect, useCallback, useRef } from "react";
import {
  ParticipantClient,
  fetchParticipants,
} from "@/lib/client/fetch-participants";

interface UseParticipantsLazyReturn {
  participants: ParticipantClient[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
  retry: () => void;
}

export const useParticipantsLazy = (
  itemsPerPage: number = 12
): UseParticipantsLazyReturn => {
  const [participants, setParticipants] = useState<ParticipantClient[]>([]);
  const [allParticipants, setAllParticipants] = useState<ParticipantClient[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate hasMore
  const hasMore = currentPage * itemsPerPage < allParticipants.length;

  const loadInitialParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const allData = await fetchParticipants();

      if (abortControllerRef.current.signal.aborted) return;

      setAllParticipants(allData);

      // Load first page
      const firstPage = allData.slice(0, itemsPerPage);
      setParticipants(firstPage);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError("Error loading participants");
      console.error("Error loading participants:", err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Load all participants initially
  useEffect(() => {
    loadInitialParticipants();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadInitialParticipants]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    // Simulate a small delay to show loading
    setTimeout(() => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newParticipants = allParticipants.slice(startIndex, endIndex);

      setParticipants((prev) => [...prev, ...newParticipants]);
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, currentPage, itemsPerPage, allParticipants, hasMore]);

  const retry = useCallback(() => {
    setError(null);
    setCurrentPage(0);
    setParticipants([]);
    loadInitialParticipants();
  }, [loadInitialParticipants]);

  return {
    participants,
    loading: loading || loadingMore,
    hasMore,
    loadMore,
    error,
    retry,
  };
};
