"use client";

import { useMemo, useCallback, memo } from "react";
import EventsList from "./events-list";
import { useEventsLazy } from "@/hooks/useEventsLazy";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const LazyEventsList = memo(function LazyEventsList({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  // Convert searchParams object to URLSearchParams
  const urlSearchParams = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  }, [searchParams]);

  const { events, loading, hasMore, loadMore, error, retry, totalEvents } =
    useEventsLazy(urlSearchParams, 12);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error loading events: {error}</p>
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (loading && events.length === 0) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="">No events found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EventsList events={events} />

      {hasMore && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              `Load More (${events.length} of ${totalEvents})`
            )}
          </Button>
        </div>
      )}

      {!hasMore && events.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm">{totalEvents} events</p>
        </div>
      )}
    </div>
  );
});

export default LazyEventsList;
