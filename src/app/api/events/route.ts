import { mockEvents } from "@/lib/mockevents";
import { EventsResponse, EventType } from "@/utils/event-types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as EventType | null;
  const date = searchParams.get("date");
  const search = searchParams.get("search");

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

  const response: EventsResponse = { events: filteredEvents };
  return NextResponse.json(response);
}
