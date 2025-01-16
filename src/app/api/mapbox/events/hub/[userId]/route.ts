import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const supabase = await createClient();

    // Step 1: Fetch hub participants
    const { data: hubParticipants, error: hubParticipantsError } =
      await supabase
        .from("hub_participants")
        .select("hub_id")
        .eq("user_id", userId);

    if (hubParticipantsError) {
      console.error("Error fetching hub participants:", hubParticipantsError);
      return NextResponse.json(
        { error: "Failed to fetch hub participants" },
        { status: 500 }
      );
    }

    const hubIds = hubParticipants.map((participant) => participant.hub_id);

    // Step 2: Fetch hubs
    const { data: hubs, error: hubsError } = await supabase
      .from("hubs")
      .select("hub_host_id")
      .in("id", hubIds);

    if (hubsError) {
      console.error("Error fetching hubs:", hubsError);
      return NextResponse.json(
        { error: "Failed to fetch hubs" },
        { status: 500 }
      );
    }

    const hostIds = hubs.map((hub) => hub.hub_host_id);

    // Step 3: Fetch locations
    const { data: locations, error: locationsError } = await supabase
      .from("map_info")
      .select("id, formatted_address")
      .in("user_id", hostIds);

    if (locationsError) {
      console.error("Error fetching locations:", locationsError);
      return NextResponse.json(
        { error: "Failed to fetch locations" },
        { status: 500 }
      );
    }

    return NextResponse.json(locations);
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { error: "An error occurred fetching hub locations" },
      { status: 500 }
    );
  }
}
