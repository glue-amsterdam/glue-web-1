import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    
    // Fetch only current tour events (not last year's events)
    // Dashboard should only show events that users can edit/create
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", userId)
      .eq("is_last_year_event", false)
      .eq("event_day_out", false);

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { error: "Error fetching events" },
        { status: 500 }
      );
    }

    if (!events) {
      return NextResponse.json({ message: "No events found" }, { status: 404 });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
