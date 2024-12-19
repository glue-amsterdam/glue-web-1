import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mapId: string }> }
) {
  const { mapId } = await params;

  if (!mapId) {
    return NextResponse.json({ error: "Map ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("map_info")
      .select("*")
      .eq("id", mapId)
      .single();

    if (!data) {
      return NextResponse.json(
        { error: "map info not found" },
        { status: 404 }
      );
    }

    if (error) {
      console.error("Error fetching map info:", error);
      return NextResponse.json(
        { error: "Failed to fetch map info" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
