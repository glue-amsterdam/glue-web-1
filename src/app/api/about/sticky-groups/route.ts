import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: headerData, error: headerError } = await supabase
      .from("about_curated")
      .select("title, description, is_visible")
      .single();

    if (headerError) {
      console.error("Error fetching sticky groups header data:", headerError);
      throw headerError;
    }

    if (!headerData.is_visible) {
      return NextResponse.json({
        title: "",
        description: "",
        is_visible: false,
      });
    }

    return NextResponse.json({
      title: headerData.title,
      description: headerData.description,
      is_visible: headerData.is_visible,
    });
  } catch (error) {
    console.error("Error in GET /api/about/sticky-groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch sticky groups header data" },
      { status: 500 }
    );
  }
}
