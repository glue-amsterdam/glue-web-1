import { mockEvents } from "@/lib/mockevents";
import { EventsResponse, EventType } from "@/utils/event-types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as EventType | null;
  const date = searchParams.get("date");
  const search = searchParams.get("search");
  const limitParam = searchParams.get("limit");

  let filteredEvents = mockEvents;

  if (type) {
    filteredEvents = filteredEvents.filter(
      (event) => event.type.toLocaleLowerCase() === type
    );
  }

  if (date) {
    filteredEvents = filteredEvents.filter(
      (event) => event.date.toLocaleLowerCase() === date
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.creator.name.toLowerCase().includes(searchLower) ||
        event.contributors.some((contributor) =>
          contributor.name.toLowerCase().includes(searchLower)
        )
    );
  }
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const limitedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  const response: EventsResponse = { events: limitedEvents };
  return NextResponse.json(response);
}
