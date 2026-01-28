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
  // Use individual values as dependencies to prevent re-renders when object reference changes but values are the same
  const searchValue = searchParams.search || "";
  const typeValue = searchParams.type || "";
  const dayValue = searchParams.day || "";

  const urlSearchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchValue && searchValue.trim() !== "") {
      params.set("search", searchValue);
    }
    if (typeValue && typeValue.trim() !== "") {
      params.set("type", typeValue);
    }
    if (dayValue && dayValue.trim() !== "") {
      params.set("day", dayValue);
    }
    return params;
  }, [searchValue, typeValue, dayValue]);

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
            className="px-4 bg-white/50 text-black"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="sr-only">Loading...</p>
              </>
            ) : (
              `More (${events.length}/${totalEvents})`
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
