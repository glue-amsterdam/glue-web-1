"use client";

import useSWR from "swr";
import EventDaysForm from "@/app/admin/forms/main-event-days-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MainEventsDaysSections() {
  const {
    data: eventDays,
    error,
    isLoading,
  } = useSWR("/api/admin/main/days", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load event days</div>;

  return <EventDaysForm initialData={eventDays} />;
}
