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

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
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
  }, [handleObserver]);

  if (!hasMore) {
    return <div className="col-span-full text-center py-8"></div>;
  }

  return (
    <div ref={observerRef} className="col-span-full flex justify-center py-8">
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="h-8" /> // Invisible space for observer
      )}
    </div>
  );
}
