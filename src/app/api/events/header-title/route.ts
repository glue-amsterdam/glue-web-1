import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_settings")
      .select("header_title")
      .single();

    if (error) {
      // If table doesn't exist or no data, return default
      console.error("Error fetching event settings:", error);
      return NextResponse.json({ header_title: "Events" });
    }

    // Return default if no data exists
    if (!data || !data.header_title) {
      return NextResponse.json({ header_title: "Events" });
    }

    return NextResponse.json({ header_title: data.header_title });
  } catch (error) {
    console.error("Error in GET /api/events/header-title:", error);
    // Always return a valid response with default value
    return NextResponse.json({ header_title: "Events" });
  }
}
