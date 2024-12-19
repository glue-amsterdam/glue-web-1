import { EventCard } from "@/app/dashboard/[userId]/your-events/event-card";
import { EventType } from "@/schemas/eventsSchemas";

interface EventListProps {
  events: EventType[];
  onEventUpdated: (updatedEvent: EventType) => void;
}

export function EventList({ events, onEventUpdated }: EventListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEventUpdated={onEventUpdated}
        />
      ))}
      {events.length === 0 && (
        <p className="text-center col-span-full">
          <span>{`You haven't created any events yet.`}</span>
        </p>
      )}
    </div>
  );
}
