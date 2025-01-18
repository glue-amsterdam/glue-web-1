import { config } from "@/env";
import { EventType } from "@/schemas/eventSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as EventType | null;
  const day = searchParams.get("day");

  const supabase = await createClient();

  let query = supabase.from("events").select(`
    *,
    organizer:user_info!organizer_id (
      user_id,
      user_name,
      participant_details (
        slug
      )
    ),
    event_day:events_days!dayId (
      label,
      date
    ),
    location:map_info!location_id (
      id,
      formatted_address
    )
  `);

  if (type) {
    query = query.ilike("type", type);
  }

  if (day) {
    query = query.eq("dayId", day);
  }

  try {
    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch co-organizers for all events
    const coOrganizerPromises = events.map((event) =>
      supabase
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
        .in("user_id", event.co_organizers || [])
    );

    const coOrganizerResults = await Promise.all(coOrganizerPromises);

    const enhancedEvents = events.map((event, index) => ({
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
        slug: event.organizer?.participant_details?.[0]?.slug || "",
      },
      location: {
        id: event.location?.id || "",
        formatted_address: event.location?.formatted_address || "",
      },
      coOrganizers:
        coOrganizerResults[index].data?.map((co) => ({
          user_id: co.user_id || "",
          user_name: co.user_name || "Unknown",
          slug: co.participant_details?.[0]?.slug || "",
        })) || [],
      rsvp: event.rsvp ?? false,
      rsvpMessage: event.rsvp_message || "",
      rsvpLink: event.rsvp_link || "",
      createdAt: event.created_at || "",
    }));

    return NextResponse.json(enhancedEvents);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
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
