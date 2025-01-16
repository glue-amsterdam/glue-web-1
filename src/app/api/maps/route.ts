import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const supabase = await createClient();

    // First, fetch accepted participants
    const { data: acceptedParticipants, error: participantError } =
      await supabase
        .from("participant_details")
        .select("user_id")
        .eq("status", "accepted");

    if (participantError) {
      console.error("Error fetching accepted participants:", participantError);
      return NextResponse.json(
        { error: "Failed to fetch accepted participants" },
        { status: 500 }
      );
    }

    const acceptedUserIds = acceptedParticipants.map((p) => p.user_id);

    // Then, fetch map info for accepted participants
    const { data: mapData, error: mapError } = await supabase
      .from("map_info")
      .select("*")
      .in("user_id", acceptedUserIds);

    if (mapError) {
      console.error("Error fetching map information:", mapError);
      return NextResponse.json(
        { error: "Failed to fetch map information" },
        { status: 500 }
      );
    }

    // Finally, fetch user info for these participants
    const { data: userData, error: userError } = await supabase
      .from("user_info")
      .select("user_id, user_name, visible_emails")
      .in("user_id", acceptedUserIds);

    if (userError) {
      console.error("Error fetching user information:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user information" },
        { status: 500 }
      );
    }

    // Combine the data
    const combinedData = mapData.map((mapInfo) => {
      const userInfo = userData.find(
        (user) => user.user_id === mapInfo.user_id
      );
      return {
        ...mapInfo,
        user_info: userInfo
          ? {
              user_name: userInfo.user_name,
              visible_emails: userInfo.visible_emails,
            }
          : null,
      };
    });

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Error fetching map information:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
