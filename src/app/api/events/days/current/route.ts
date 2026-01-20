import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { EventDay } from "@/schemas/eventSchemas";

/**
 * Endpoint to fetch current event days from the events_days table.
 * This always returns the current event days, regardless of tour_status.
 * Used in dashboard for creating/editing events where we always want current days.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Always fetch current event days from events_days table
    // Dashboard operations should always use current days, not snapshots
    const { data: eventDays, error } = await supabase
      .from("events_days")
      .select("dayId, label, date")
      .order("dayId");

    if (error) {
      console.error("Error fetching current event days:", error);
      return NextResponse.json(
        { error: "Failed to fetch current event days" },
        { status: 500 }
      );
    }

    const formattedDays: EventDay[] = (eventDays || []).map((day) => ({
      dayId: day.dayId,
      label: day.label,
      date: day.date,
    }));

    return NextResponse.json(formattedDays);
  } catch (error) {
    console.error("Error in GET /api/events/days/current:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
