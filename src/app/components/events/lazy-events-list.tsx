"use client";

import { IndividualEventResponse } from "@/schemas/eventSchemas";
import EventsList from "./events-list";

export default function LazyEventsList({
  events,
}: {
  events: IndividualEventResponse[];
}) {
  return <EventsList events={events} />;
}
