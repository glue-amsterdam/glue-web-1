import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EventDay, eventDaysResponseSchema } from "@/schemas/eventSchemas";
import { config } from "@/env";

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

    // Handle image deletion for events associated with days to be removed
    if (daysToRemove.length > 0) {
      // Fetch events for days to be removed
      const { data: eventsToDelete, error: eventsFetchError } = await supabase
        .from("events")
        .select("id, image_url, organizer_id")
        .in("dayId", daysToRemove);

      if (eventsFetchError) {
        throw new Error(
          `Error fetching events for deletion: ${eventsFetchError.message}`
        );
      }

      // Delete image files from storage
      for (const event of eventsToDelete) {
        if (event.image_url && event.organizer_id) {
          const filename = event.image_url.split("/").pop();
          const imagePath = `events/${event.organizer_id}/${filename}`;
          const { error: deleteError } = await supabase.storage
            .from(config.bucketName)
            .remove([imagePath]);

          if (deleteError) {
            console.error(
              `Failed to delete image for event ${event.id}: ${deleteError.message}`
            );
            // Log the error but continue with the process
          } else {
            console.log(`Successfully deleted image for event ${event.id}`);
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

    // Remove days (this will cascade delete associated events)
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
