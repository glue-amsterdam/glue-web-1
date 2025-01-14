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
          map:map_info (
           id, formatted_address
          ),
          participant_details (
            slug
          )
        ),
        event_day:events_days!dayId (
          label,
          date
        )
      `
      )
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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
        label: event.event_day?.label || "",
        date: event.event_day?.date || "",
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
        map_id: event.organizer?.map?.[0]?.id || event.organizer?.user_id || "",
        slug: event.organizer?.participant_details?.slug || "",
      },
      mapInfo: event.organizer?.map?.[0] || null,
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
