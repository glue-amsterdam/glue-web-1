import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  const ids = searchParams.get("ids");

  try {
    const supabase = await createClient();

    // First query: Fetch user_info
    let userQuery = supabase.from("user_info").select("user_id, user_name");

    if (term) {
      userQuery = userQuery.ilike("user_name", `%${term}%`);
    }

    if (ids) {
      const idArray = ids.split(",");
      userQuery = userQuery.in("user_id", idArray);
    }

    const { data: userData, error: userError } = await userQuery;

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Second query: Fetch participant_details
    const userIds = userData.map((user) => user.user_id);

    const { data: participantData, error: participantError } = await supabase
      .from("participant_details")
      .select("user_id, slug, status")
      .in("user_id", userIds)
      .eq("status", "accepted");

    if (participantError) {
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    // Combine the data
    const formattedData = userData
      .filter((user) =>
        participantData.some(
          (participant) => participant.user_id === user.user_id
        )
      )
      .map((user) => {
        const participantDetails = participantData.find(
          (participant) => participant.user_id === user.user_id
        );
        return {
          id: user.user_id,
          user_name: user.user_name,
          slug: participantDetails?.slug || null,
        };
      })
      .slice(0, 10);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
