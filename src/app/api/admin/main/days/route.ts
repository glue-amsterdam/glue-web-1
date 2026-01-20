import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EventDay, eventDaysResponseSchema } from "@/schemas/eventSchemas";

export async function GET() {
  try {
    const supabase = await createClient();

    // Admin always manages current event days (from events_days table)
    // The snapshot in tour_status is only for viewing the "older" tour
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

    // Mark events as last year events when their days are removed
    // With the snapshot approach, we simply mark events as previous tour events
    // instead of changing their dayId
    if (daysToRemove.length > 0) {
      // Fetch events associated with the days being removed
      const { data: eventsToUpdate, error: eventsFetchError } = await supabase
        .from("events")
        .select("id")
        .in("dayId", daysToRemove)
        .eq("is_last_year_event", false);

      if (eventsFetchError) {
        throw new Error(
          `Error fetching events for removed days: ${eventsFetchError.message}`
        );
      }

      // Mark events as last year events
      if (eventsToUpdate && eventsToUpdate.length > 0) {
        const eventIds = eventsToUpdate.map((e) => e.id);
        const { error: updateError } = await supabase
          .from("events")
          .update({ is_last_year_event: true })
          .in("id", eventIds);

        if (updateError) {
          throw new Error(
            `Error marking events as last year: ${updateError.message}`
          );
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
