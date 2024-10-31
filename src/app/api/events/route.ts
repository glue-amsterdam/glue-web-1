import { mockEvents } from "@/lib/mockevents";
import { users } from "@/lib/mockMembers";
import {
  EnhancedUser,
  EventType,
  IndividualEventResponse,
} from "@/utils/event-types";
import { DayID } from "@/utils/menu-types";
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

  const enhancedEvents: IndividualEventResponse[] = filteredEvents.map(
    (event) => {
      const organizer = getOrganizerDetails(
        users.find((u) => u.userId === event.organizer.userId)
      );
      const coOrganizers = event.coOrganizers
        .map((co) => getUserDetails(users.find((u) => u.userId === co.userId)))
        .filter((co): co is EnhancedUser => co !== null);

      if (search) {
        const searchLower = search.toLowerCase();
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.name.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            organizer?.userName.toLowerCase().includes(searchLower) ||
            coOrganizers.some((coOrganizer) =>
              coOrganizer.userName.toLowerCase().includes(searchLower)
            )
        );
      }

      return {
        ...event,
        organizer: organizer || { userId: "", userName: "Unknown" },
        coOrganizers,
      };
    }
  );

  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const limitedEvents = limit ? enhancedEvents.slice(0, limit) : enhancedEvents;

  return NextResponse.json(limitedEvents);
}
