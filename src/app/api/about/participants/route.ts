import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: participantsData } = await supabase
      .from("about_participants")
      .select("title,description")
      .single();

    if (!participantsData) {
      throw new Error(
        "Failed to fetch participants about data in client api call"
      );
    }
    console.log("participantsData:", participantsData);

    return NextResponse.json(participantsData);
  } catch (error) {
    console.error("Error in GET /api/about/participants", error);
    return NextResponse.json(
      {
        error:
          "An error occurred while fetching participants about data in client api call",
      },
      { status: 500 }
    );
  }
}
