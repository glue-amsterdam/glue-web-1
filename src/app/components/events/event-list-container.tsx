"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const LazyEventsList = dynamic(
  () => import("@/app/components/events/lazy-events-list"),
  {
    loading: () => (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Loading events...</p>
      </div>
    ),
  }
);

export default function EventListContainer({
  params,
}: {
  params: URLSearchParams;
}) {
  // Extract filter parameters
  // Use actual filter values as dependencies to prevent re-renders when only eventId changes
  const searchValue = params.get("search") || "";
  const typeValue = params.get("type") || "";
  const dayValue = params.get("day") || "";

  const filterParams = useMemo(() => {
    return { search: searchValue, type: typeValue, day: dayValue };
  }, [searchValue, typeValue, dayValue]);

  return (
    <section aria-label="Event list">
      <LazyEventsList searchParams={filterParams} />
    </section>
  );
}
