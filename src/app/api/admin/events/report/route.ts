import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch all events with related data (including both current and previous tour events)
    // Note: events table has dayId (camelCase) which needs to be handled correctly
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        type,
        start_time,
        end_time,
        rsvp,
        rsvp_message,
        rsvp_link,
        created_at,
        dayId,
        event_day_time,
        is_last_year_event,
        event_day_out,
        organizer:user_info!organizer_id (
          user_id,
          user_name
        ),
        location:map_info!location_id (
          id,
          formatted_address
        ),
        co_organizers
      `)
      .eq("event_day_out", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events for report:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    // Fetch event days for current tour
    const { data: eventDays } = await supabase
      .from("events_days")
      .select("dayId, label, date")
      .order("dayId");

    const eventDaysMap = new Map(
      (eventDays || []).map((day) => [day.dayId, { label: day.label, date: day.date }])
    );

    // Fetch co-organizers for all events
    const coOrganizerPromises = (events || []).map((event) => {
      if (!event.co_organizers || event.co_organizers.length === 0) {
        return Promise.resolve({ data: [] });
      }
      return supabase
        .from("user_info")
        .select("user_id, user_name")
        .in("user_id", event.co_organizers);
    });

    const coOrganizerResults = await Promise.all(coOrganizerPromises);

    // Format events for report
    const reportData = (events || []).map((event, index) => {
      // Get day information - use event_day_time if dayId doesn't exist in current days
      const dayInfo = eventDaysMap.get(event.dayId);
      const dayDate = dayInfo?.date || event.event_day_time || null;
      const dayLabel = dayInfo?.label || event.dayId || "N/A";

      return {
        id: event.id,
        title: event.title || "Untitled Event",
        description: event.description || "",
        type: event.type || "N/A",
        day: dayLabel,
        date: dayDate
          ? new Date(dayDate).toLocaleDateString()
          : "N/A",
        startTime: event.start_time || "N/A",
        endTime: event.end_time || "N/A",
        organizer: event.organizer?.user_name || "Unknown",
        location: event.location?.formatted_address || "N/A",
        coOrganizers:
          coOrganizerResults[index]?.data
            ?.map((co) => co.user_name)
            .join(", ") || "None",
        rsvp: event.rsvp ? "Yes" : "No",
        rsvpMessage: event.rsvp_message || "",
        rsvpLink: event.rsvp_link || "",
        createdAt: event.created_at
          ? new Date(event.created_at).toLocaleString()
          : "N/A",
        updatedAt: "N/A", // events table doesn't have updated_at field
        tourStatus: event.is_last_year_event ? "Previous Tour" : "Current Tour",
      };
    });

    // Return events and available days for filtering
    const availableDays = (eventDays || []).map((day) => ({
      dayId: day.dayId,
      label: day.label,
    }));

    return NextResponse.json({
      events: reportData,
      total: reportData.length,
      availableDays,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/events/report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
