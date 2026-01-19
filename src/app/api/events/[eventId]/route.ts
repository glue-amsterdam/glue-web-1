import { config } from "@/env";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  if (!eventId)
    return NextResponse.json(
      { error: "Event ID is required" },
      { status: 400 }
    );

  try {
    const supabase = await createClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        `
          *,
          organizer:user_info!organizer_id (
            user_id,
            user_name,
            participant_details (
              slug
            )
          ),
          location:map_info!location_id (
            id,
            formatted_address
          )
        `
      )
      .eq("id", eventId)
      .eq("event_day_out", false)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Additional check: ensure event is not marked as day-off
    if (event.event_day_out || event.dayId === "day-off") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch event day separately (since foreign key constraint was removed)
    // Only show events that have a valid dayId that exists in events_days
    let eventDay = null;
    if (event.dayId) {
      const { data: dayData, error: dayError } = await supabase
        .from("events_days")
        .select("dayId, label, date")
        .eq("dayId", event.dayId)
        .single();

      if (!dayError && dayData) {
        eventDay = { label: dayData.label, date: dayData.date };
      }
    }

    // If event doesn't have a valid day, return 404
    if (!event.dayId || !eventDay) {
      return NextResponse.json(
        { error: "Event not found or event day is not valid" },
        { status: 404 }
      );
    }

    // Fetch co-organizers
    const { data: coOrganizers, error: coOrganizerError } = await supabase
      .from("user_info")
      .select(
        `
          user_id, 
          user_name,
          participant_details (
            slug
          )
        `
      )
      .in("user_id", event.co_organizers || []);

    if (coOrganizerError) {
      console.error("Error fetching co-organizers:", coOrganizerError);
      return NextResponse.json(
        { error: coOrganizerError.message },
        { status: 500 }
      );
    }

    // Structure the event data
    const enhancedEvent = {
      eventId: event.id,
      name: event.title,
      description: event.description || "",
      type: event.type || "",
      date: {
        dayId: event.dayId,
        label: eventDay?.label || "",
        date: eventDay?.date || "",
      },
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      thumbnail: {
        image_url: event.image_url || "",
        alt: `${event.title} - event from GLUE design routes in ${config.cityName}`,
      },
      organizer: {
        user_id: event.organizer?.user_id || "",
        user_name: event.organizer?.user_name || "Unknown",
        slug: event.organizer?.participant_details?.slug || "",
      },
      location: {
        id: event.location?.id || "",
        formatted_address: event.location?.formatted_address || "",
      },
      coOrganizers:
        coOrganizers?.map((co) => ({
          user_id: co.user_id || "",
          user_name: co.user_name || "Unknown",
          slug: co.participant_details?.[0]?.slug || "",
        })) || [],
      rsvp: event.rsvp ?? false,
      rsvpMessage: event.rsvp_message || "",
      rsvpLink: event.rsvp_link || "",
      createdAt: event.created_at || "",
      updatedAt: event.updated_at || "",
    };

    return NextResponse.json(enhancedEvent);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const eventData = await request.json();
    const { eventId } = await params;
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select();
    if (error) {
      console.error("Error updating event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      message: "Event updated successfully",
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { eventId } = await params;

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
