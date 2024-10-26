"use client ";

import { Event } from "@/utils/event-types";
import EventCard from "./event-card";

export default function EventsList({ events }: { events: Event[] }) {
  if (events.length == 0) {
    return <div>No events Found</div>;
  }
  return (
    <ul className="grid grid-cols-1 gap-6">
      {events.map((event, index) => (
        <li key={event.id}>
          <EventCard i={index} event={event} />
        </li>
      ))}
    </ul>
  );
}
