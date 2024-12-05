import { mockEvents } from "@/lib/mockevents";
import { users } from "@/lib/mockMembers";
import { getOrganizerDetails, getUserDetails } from "@/utils/userHelpers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  if (!params || !params.eventId) {
    return NextResponse.json(
      { message: "Event ID is required" },
      { status: 400 }
    );
  }
  const { eventId } = params;

  const event = mockEvents.find((event) => event.eventId === eventId);
  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const organizer = getOrganizerDetails(
    users.find((u) => u.user_id === event.organizer.user_id)
  );

  if (!organizer) {
    return NextResponse.json(
      { message: "Organizer not found" },
      { status: 404 }
    );
  }

  const coOrganizers = (event.coOrganizers || [])
    .map((co) => getUserDetails(users.find((u) => u.user_id === co.user_id)))
    .filter((co) => co !== null);

  const eventWithDetails = {
    ...event,
    organizer,
    coOrganizers,
  };

  return NextResponse.json(eventWithDetails);
}
