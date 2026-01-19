import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EventDay, eventDaysResponseSchema } from "@/schemas/eventSchemas";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: eventDays, error } = await supabase
      .from("events_days")
      .select("*")
      .order("dayId");

    if (error) {
      throw new Error(`Error fetching event days: ${error.message}`);
    }

    const validatedData = eventDaysResponseSchema.parse({ eventDays });

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Error in GET /api/admin/main/days:", error);
    return NextResponse.json(
      { error: "Failed to fetch event days" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const { eventDays } = await request.json();

    // Fetch existing days
    const { data: existingDays, error: fetchError } = await supabase
      .from("events_days")
      .select("dayId")
      .order("dayId");

    if (fetchError) {
      throw new Error(`Error fetching existing days: ${fetchError.message}`);
    }

    // Determine days to add, update, and remove
    const existingDayIds = existingDays.map(
      (day: { dayId: string }) => day.dayId
    );
    const newDayIds = eventDays.map((day: EventDay) => day.dayId);

    const daysToAdd = eventDays.filter(
      (day: EventDay) => !existingDayIds.includes(day.dayId)
    );
    const daysToUpdate = eventDays.filter((day: EventDay) =>
      existingDayIds.includes(day.dayId)
    );
    const daysToRemove = existingDayIds.filter(
      (dayId: string) => !newDayIds.includes(dayId)
    );

    // Mark events as "day-off" before removing days
    // This preserves the original day date/time and prevents events from reappearing
    // if a new day with the same ID is created later
    if (daysToRemove.length > 0) {
      // Fetch the days to be removed to get their date information
      const { data: daysToRemoveData, error: daysFetchError } = await supabase
        .from("events_days")
        .select("dayId, date")
        .in("dayId", daysToRemove);

      if (daysFetchError) {
        throw new Error(
          `Error fetching days to remove: ${daysFetchError.message}`
        );
      }

      // For each day being removed, update associated events
      for (const day of daysToRemoveData || []) {
        // Fetch events associated with this day
        const { data: eventsToUpdate, error: eventsFetchError } = await supabase
          .from("events")
          .select("id")
          .eq("dayId", day.dayId);

        if (eventsFetchError) {
          throw new Error(
            `Error fetching events for day ${day.dayId}: ${eventsFetchError.message}`
          );
        }

        // Update events: mark as day-off, preserve original day date, set dayId to 'day-off'
        if (eventsToUpdate && eventsToUpdate.length > 0) {
          const { error: updateError } = await supabase
            .from("events")
            .update({
              event_day_out: true,
              event_day_time: day.date ? new Date(day.date).toISOString() : null,
              dayId: "day-off",
            })
            .eq("dayId", day.dayId);

          if (updateError) {
            throw new Error(
              `Error updating events for day ${day.dayId}: ${updateError.message}`
            );
          }
        }
      }
    }

    // Add new days
    for (const day of daysToAdd) {
      const { error: insertError } = await supabase
        .from("events_days")
        .insert(day);

      if (insertError) {
        throw new Error(`Error inserting new day: ${insertError.message}`);
      }
    }

    // Update existing days
    for (const day of daysToUpdate) {
      const { error: updateError } = await supabase
        .from("events_days")
        .update({ label: day.label, date: day.date })
        .eq("dayId", day.dayId);

      if (updateError) {
        throw new Error(`Error updating day: ${updateError.message}`);
      }
    }

    // Remove days (events are preserved - their dayId will remain but point to a deleted day)
    // Note: If the database has ON DELETE CASCADE constraint, events will still be deleted
    // This constraint needs to be changed in the database to preserve events
    for (const dayId of daysToRemove) {
      const { error: deleteError } = await supabase
        .from("events_days")
        .delete()
        .eq("dayId", dayId);

      if (deleteError) {
        throw new Error(`Error deleting day: ${deleteError.message}`);
      }
    }

    // Fetch updated days
    const { data: updatedDays, error: finalFetchError } = await supabase
      .from("events_days")
      .select("*")
      .order("dayId");

    if (finalFetchError) {
      throw new Error(
        `Error fetching updated days: ${finalFetchError.message}`
      );
    }

    return NextResponse.json({ eventDays: updatedDays });
  } catch (error) {
    console.error("Error updating event days:", error);
    return NextResponse.json(
      { error: "Failed to update event days" },
      { status: 500 }
    );
  }
}
