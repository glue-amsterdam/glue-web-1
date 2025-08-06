import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch sticky groups header data
    const { data: headerData, error: headerError } = await supabase
      .from("about_curated")
      .select("title, description, is_visible, text_color, background_color")
      .single();

    if (headerError) {
      console.error("Error fetching sticky groups header data:", headerError);
      throw headerError;
    }

    // If not visible, return early with only header data
    if (!headerData.is_visible) {
      return NextResponse.json({
        title: "",
        description: "",
        is_visible: false,
        text_color: "#ffffff",
        background_color: "#000000",
      });
    }

    return NextResponse.json({
      title: headerData.title,
      description: headerData.description,
      is_visible: headerData.is_visible,
      text_color: headerData.text_color,
      background_color: headerData.background_color,
    });
  } catch (error) {
    console.error("Error in GET /api/about/sticky-groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch sticky groups header data" },
      { status: 500 }
    );
  }
}
