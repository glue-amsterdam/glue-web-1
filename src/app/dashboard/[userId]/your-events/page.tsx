"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { EventManagement } from "@/app/dashboard/[userId]/your-events/event-management";
import { useToast } from "@/hooks/use-toast";
import type { EventType } from "@/schemas/eventsSchemas";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function EventsPage() {
  const { targetUserId } = useDashboardContext();
  const { toast } = useToast();
  const {
    data: events,
    error,
    isLoading,
    mutate,
  } = useSWR<EventType[]>(`/api/events/participant/${targetUserId}`, fetcher);

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load events</div>;
  if (!events) return <div>No events available</div>;

  const handleEventUpdated = (updatedEvent: EventType) => {
    mutate(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
      false
    );
  };

  const handleEventDeleted = async (deletedEventId: string) => {
    try {
      // Optimistically update the UI
      mutate(
        events.filter((event) => event.id !== deletedEventId),
        false
      );

      // Show success toast
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting event:", error);

      // Revert the optimistic update
      mutate();

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <EventManagement
      events={events}
      onEventUpdated={handleEventUpdated}
      onEventDeleted={handleEventDeleted}
    />
  );
}

export default EventsPage;
