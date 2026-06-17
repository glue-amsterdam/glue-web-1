import { getAvailableEventLocations } from "@/lib/events/get-available-event-locations";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const supabase = await createClient();
    const { userLocations } = await getAvailableEventLocations(supabase, userId);

    return NextResponse.json(userLocations);
  } catch (error) {
    console.error("Error fetching participant locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
