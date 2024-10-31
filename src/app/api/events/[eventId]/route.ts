import { mockEvents } from "@/lib/mockevents";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  if (!params || !params.eventId) {
    return NextResponse.json(
      { message: "Event ID is required" },
      { status: 400 }
    );
  }

  const { eventId } = params;

  const filteredEvents = mockEvents.filter(
    (event) => event.eventId === eventId
  );

  if (filteredEvents.length === 0) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(filteredEvents[0]);
}
