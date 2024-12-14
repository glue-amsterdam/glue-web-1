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
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", userId);

    if (error) {
      console.error("Error fetching events:", error);
      return null;
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
