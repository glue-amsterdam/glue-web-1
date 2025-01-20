import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch all data from map_info
    const { data: mapData, error: mapError } = await supabase
      .from("map_info")
      .select("*")
      .eq("no_address", false);

    if (mapError) {
      console.error("Error fetching map information:", mapError);
      return NextResponse.json(
        { error: "Failed to fetch map information" },
        { status: 500 }
      );
    }

    // Extract user_ids from map_info
    const userIds = mapData.map((item) => item.user_id);

    // 2. Fetch participant_details for these user_ids and filter for accepted status
    const { data: participantDetails, error: participantError } = await supabase
      .from("participant_details")
      .select("user_id, status")
      .in("user_id", userIds)
      .eq("status", "accepted");

    if (participantError) {
      console.error("Error fetching participant details:", participantError);
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    // Create a set of accepted user_ids for faster lookup
    const acceptedUserIds = new Set(participantDetails.map((p) => p.user_id));

    // 3. Fetch user_info for accepted participants
    const { data: userData, error: userError } = await supabase
      .from("user_info")
      .select("user_id, user_name")
      .in("user_id", Array.from(acceptedUserIds));

    if (userError) {
      console.error("Error fetching user information:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user information" },
        { status: 500 }
      );
    }

    // 4. Fetch hubs data
    const { data: hubsData, error: hubsError } = await supabase
      .from("hubs")
      .select("hub_host_id, name");

    if (hubsError) {
      console.error("Error fetching hubs information:", hubsError);
      return NextResponse.json(
        { error: "Failed to fetch hubs information" },
        { status: 500 }
      );
    }

    // Combine the data
    const combinedData = mapData
      .filter((mapInfo) => acceptedUserIds.has(mapInfo.user_id))
      .map((mapInfo) => {
        const userInfo = userData.find(
          (user) => user.user_id === mapInfo.user_id
        );
        const hubInfo = hubsData.find(
          (hub) => hub.hub_host_id === mapInfo.user_id
        );

        return {
          ...mapInfo,
          user_info: userInfo
            ? {
                user_name: hubInfo ? hubInfo.name : userInfo.user_name,
              }
            : null,
        };
      });

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Error in map API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
