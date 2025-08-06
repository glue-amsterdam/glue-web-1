"use client";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { EventForm } from "@/app/dashboard/[userId]/create-events/create-event-form";
import { EventType } from "@/schemas/eventsSchemas";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreateEventPage() {
  const { targetUserId } = useDashboardContext();
  const {
    data: events,
    error,
    isLoading,
  } = useSWR<EventType[]>(`/api/events/participant/${targetUserId}`, fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load events</div>;
  if (!events) return <div>No events available</div>;

  const eventCount = events.length;
  const canCreateEvent = eventCount < 6;

  return (
    <EventForm
      existingEventCount={eventCount}
      canCreateEvent={canCreateEvent}
    />
  );
}

export default CreateEventPage;
