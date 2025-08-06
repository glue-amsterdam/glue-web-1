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
  const filterParams = useMemo(() => {
    const searchParams =
      params instanceof URLSearchParams ? params : new URLSearchParams(params);

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const day = searchParams.get("day") || "";
    return { search, type, day };
  }, [params]);

  return (
    <section aria-label="Event list">
      <LazyEventsList searchParams={filterParams} />
    </section>
  );
}
