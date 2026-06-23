import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  const ids = searchParams.get("ids");

  try {
    const supabase = await createClient();

    let participantQuery = supabase
      .from("participant_details")
      .select("user_id, display_name, slug")
      .eq("status", "accepted");

    if (term) {
      participantQuery = participantQuery.ilike("display_name", `%${term}%`);
    }

    if (ids) {
      const idArray = ids.split(",").filter(Boolean);
      if (idArray.length === 0) {
        return NextResponse.json([]);
      }
      participantQuery = participantQuery.in("user_id", idArray);
    }

    const { data: participantData, error: participantError } =
      await participantQuery;

    if (participantError) {
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    const formattedData = (participantData ?? [])
      .map((user) => {
        return {
          id: user.user_id,
          user_name: user.display_name ?? "Unknown User",
          slug: user.slug || null,
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
