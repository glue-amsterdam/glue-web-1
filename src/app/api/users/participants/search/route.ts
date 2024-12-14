import { createClient } from "@/utils/supabase/server";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  const ids = searchParams.get("ids");

  try {
    const supabase = await createClient();
    let query = supabase.from("user_info").select(`
        user_id,
        user_name,
        participant_details (slug)
      `);

    if (term) {
      query = query.filter("user_name", "ilike", `%${term}%`);
    }

    if (ids) {
      const idArray = ids.split(",");
      query = query.in("user_id", idArray);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error("Error fetching participants:", error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    // Reshape the data to match the expected format
    const formattedData = data.map((participant) => ({
      id: participant.user_id,
      user_name: participant.user_name,
      slug:
        participant.participant_details &&
        Array.isArray(participant.participant_details)
          ? participant.participant_details[0].slug
          : null,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
