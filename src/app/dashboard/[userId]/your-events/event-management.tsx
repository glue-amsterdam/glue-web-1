"use client";

import { EventList } from "@/app/dashboard/[userId]/your-events/event-list";
import { EventType } from "@/schemas/eventsSchemas";

interface EventManagementProps {
  events: EventType[];
  onEventUpdated: (updatedEvent: EventType) => void;
  onEventDeleted: (deletedEventId: string) => void;
}

export function EventManagement({
  events,
  onEventUpdated,
  onEventDeleted,
}: EventManagementProps) {
  return (
    <div className="w-full max-w-[80%] mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Events</h2>
      </div>
      <EventList
        events={events}
        onEventUpdated={onEventUpdated}
        onEventDeleted={onEventDeleted}
      />
    </div>
  );
}
