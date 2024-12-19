"use client";

import { EventList } from "@/app/dashboard/[userId]/your-events/event-list";
import { EventType } from "@/schemas/eventsSchemas";

interface EventManagementProps {
  events: EventType[];
  onEventUpdated: (updatedEvent: EventType) => void;
}

export function EventManagement({
  events,
  onEventUpdated,
}: EventManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Events</h2>
      </div>
      <EventList events={events} onEventUpdated={onEventUpdated} />
    </div>
  );
}
