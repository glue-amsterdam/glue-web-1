import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("map_info")
      .select("id, formatted_address")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching locations:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch locations",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An Error occured fetching participant map" },
      { status: 500 }
    );
  }
}
