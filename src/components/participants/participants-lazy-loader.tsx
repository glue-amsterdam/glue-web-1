"use client";

import { useEffect, useRef, useCallback } from "react";
import LoadingSpinner from "../../app/components/LoadingSpinner";

interface ParticipantsLazyLoaderProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export default function ParticipantsLazyLoader({
  onLoadMore,
  hasMore,
  loading,
}: ParticipantsLazyLoaderProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);

  // Update refs when props change
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    hasMoreRef.current = hasMore;
    loadingRef.current = loading;
  }, [onLoadMore, hasMore, loading]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMoreRef.current && !loadingRef.current) {
        onLoadMoreRef.current();
      }
    },
    [] // Empty dependencies - we use refs instead
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px", // Load when 100px away from element
      threshold: 0.1,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependencies - observer is created only once

  if (!hasMore) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-gray-500">No more participants to load</p>
      </div>
    );
  }

  return (
    <div ref={observerRef} className="col-span-full flex justify-center py-8">
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner />
          <span>Loading more participants...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="h-8" /> {/* Invisible space for observer */}
          <button
            onClick={() => {
              onLoadMoreRef.current();
            }}
            className="px-4 py-2 bg-white/50 text-black rounded hover:bg-white/70 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
