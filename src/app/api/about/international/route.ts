import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: internationalData, error } = await supabase
      .from("about_international")
      .select("title, subtitle, button_text, website, button_color")
      .eq("id", "about-international-section")
      .single();

    if (error) throw error;

    return NextResponse.json(internationalData);
  } catch (error) {
    console.error("Error in GET /api/admin/about/international", error);
    return NextResponse.json(
      { error: "An error occurred while fetching international content data" },
      { status: 500 }
    );
  }
}
