"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { EventManagement } from "@/app/dashboard/[userId]/your-events/event-management";
import { EventType } from "@/schemas/eventsSchemas";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function EventsPage() {
  const { targetUserId } = useDashboardContext();
  const {
    data: events,
    error,
    isLoading,
    mutate,
  } = useSWR<EventType[]>(`/api/events/participant/${targetUserId}`, fetcher);

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load events</div>;
  if (!events) return <div>No events available</div>;

  return (
    <EventManagement
      events={events}
      onEventUpdated={(updatedEvent: EventType) => {
        mutate(
          events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
          false
        );
      }}
    />
  );
}

export default EventsPage;
