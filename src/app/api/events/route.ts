import { config } from "@/env";
import { EventType } from "@/schemas/eventSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as EventType | null;
  const day = searchParams.get("day");
  const search = searchParams.get("search");

  const supabase = await createClient();

  // Fetch tour status first to determine filtering logic
  const { data: tourStatus, error: tourStatusError } = await supabase
    .from("tour_status")
    .select("current_tour_status")
    .single();

  if (tourStatusError) {
    console.error("Error fetching tour status:", tourStatusError);
    // Default to "new" if tour status fetch fails
  }

  const currentTourStatus = tourStatus?.current_tour_status || "new";

  let query = supabase.from("events").select(`
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
  `);

  if (type) {
    query = query.ilike("type", type);
  }

  if (day) {
    query = query.eq("dayId", day);
  }

  // Exclude events marked as "day-off" (events that lost their day)
  query = query.eq("event_day_out", false);

  // Filter by tour status
  // If "new": show only current tour events (is_last_year_event = false)
  // If "older": show only previous tour events (is_last_year_event = true)
  if (currentTourStatus === "new") {
    query = query.eq("is_last_year_event", false);
  } else if (currentTourStatus === "older") {
    query = query.eq("is_last_year_event", true);
  }

  // Remove the problematic OR query - we'll filter in JavaScript instead
  // if (search) {
  //   query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  // }

  try {
    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch event days separately (since foreign key constraint was removed)
    // Filter out events with dayId = 'day-off' (they're already filtered by event_day_out = false)
    const uniqueDayIds = [
      ...new Set(
        events.map((e) => e.dayId).filter((id) => id && id !== "day-off")
      ),
    ];
    let eventDaysMap = new Map();

    // Fetch event days based on tour status
    // If "new": fetch from events_days table
    // If "older": use snapshot from tour_status
    let eventDays: Array<{ dayId: string; label: string; date: string | null }> = [];
    
    if (uniqueDayIds.length > 0) {
      if (currentTourStatus === "new") {
        // Fetch current event days from events_days table
        const { data: eventDaysData, error: daysError } = await supabase
          .from("events_days")
          .select("dayId, label, date")
          .in("dayId", uniqueDayIds);

        if (daysError) {
          console.error("Error fetching event days:", daysError);
        } else {
          eventDays = eventDaysData || [];
        }
      } else if (currentTourStatus === "older") {
        // Fetch snapshot from tour_status
        const { data: tourStatusData, error: tourStatusError } = await supabase
          .from("tour_status")
          .select("previous_tour_event_days")
          .single();

        if (tourStatusError) {
          console.error("Error fetching tour status:", tourStatusError);
        } else {
          const snapshot = tourStatusData?.previous_tour_event_days as
            | Array<{ dayId: string; label: string; date: string | null }>
            | null;
          // Filter snapshot to only include days that match the events' dayIds
          eventDays = (snapshot || []).filter((day) =>
            uniqueDayIds.includes(day.dayId)
          );
        }
      }

      if (eventDays && eventDays.length > 0) {
        eventDaysMap = new Map(
          eventDays.map((day) => [day.dayId, { label: day.label, date: day.date }])
        );
      }
    }

    // Filter events to only include those with valid dayId that exists in events_days
    // (events with day-off are already excluded by the query filter)
    const validEvents = events.filter((event) => {
      return event.dayId && event.dayId !== "day-off" && eventDaysMap.has(event.dayId);
    });

    // Fetch co-organizers for valid events only
    const coOrganizerPromises = validEvents.map((event) =>
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

    let enhancedEvents = validEvents.map((event, index) => ({
      eventId: event.id,
      name: event.title,
      description: event.description || "",
      type: event.type || "",
      date: {
        dayId: event.dayId,
        label: eventDaysMap.get(event.dayId)?.label || "",
        date: eventDaysMap.get(event.dayId)?.date || "",
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

    // If there's a search term, also filter by co-organizers
    if (search) {
      enhancedEvents = enhancedEvents.filter((event) => {
        const searchLower = search.toLowerCase();

        // Check if any co-organizer name matches the search
        const coOrganizerMatch = event.coOrganizers.some((co) =>
          co.user_name.toLowerCase().includes(searchLower)
        );

        // Check if event title, description, or organizer name matches
        const eventMatch =
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.organizer.user_name.toLowerCase().includes(searchLower);

        return eventMatch || coOrganizerMatch;
      });
    }

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
