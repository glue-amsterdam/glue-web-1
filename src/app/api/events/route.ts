import { mockEvents } from "@/lib/mockevents";
import { users } from "@/lib/mockMembers";
import {
  EnhancedUser,
  EventType,
  IndividualEventResponse,
} from "@/schemas/eventSchemas";
import { DayID } from "@/utils/menu-types";
import { createClient } from "@/utils/supabase/server";
import { getOrganizerDetails, getUserDetails } from "@/utils/userHelpers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as EventType | null;
  const day = searchParams.get("day") as DayID | null;
  const search = searchParams.get("search");
  const limitParam = searchParams.get("limit");

  let filteredEvents = mockEvents;

  if (type) {
    filteredEvents = filteredEvents.filter(
      (event) => event.type.toLowerCase() === type.toLowerCase()
    );
  }

  if (day) {
    filteredEvents = filteredEvents.filter((event) => event.date.dayId === day);
  }

  const enhancedEvents: IndividualEventResponse[] = filteredEvents
    .map((event) => {
      const organizer = getOrganizerDetails(
        users.find((u) => u.user_id === event.organizer.user_id)
      ) || { user_id: "", user_name: "Unknown", mapId: "" };
      const coOrganizers = (event.coOrganizers ?? [])
        .map((co) =>
          getUserDetails(users.find((u) => u.user_id === co.user_id))
        )
        .filter((co): co is EnhancedUser => co !== null);

      const enhancedEvent: IndividualEventResponse = {
        ...event,
        organizer: {
          ...organizer,
          map_id: organizer.user_id || organizer.user_id,
        },
        coOrganizers,
        rsvp: event.rsvp ?? false,
      };

      if (search) {
        const searchLower = search.toLowerCase();
        if (
          enhancedEvent.name.toLowerCase().includes(searchLower) ||
          enhancedEvent.description.toLowerCase().includes(searchLower) ||
          enhancedEvent.organizer.user_name
            .toLowerCase()
            .includes(searchLower) ||
          (enhancedEvent.coOrganizers?.some((coOrganizer) =>
            coOrganizer.user_name.toLowerCase().includes(searchLower)
          ) ??
            false)
        ) {
          return enhancedEvent;
        }
        return null;
      }

      return enhancedEvent;
    })
    .filter((event): event is IndividualEventResponse => event !== null);

  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const limitedEvents = limit ? enhancedEvents.slice(0, limit) : enhancedEvents;

  return NextResponse.json(limitedEvents);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const eventData = await request.json();

    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select();

    if (error) {
      console.error("Error inserting event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Event created successfully",
      event: data[0],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
