import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: internationalData, error } = await supabase
      .from("about_international")
      .select("title, subtitle, button_text, website, button_color, is_visible")
      .eq("id", "about-international-section")
      .single();

    if (error) {
      console.error("Error fetching international data:", error);
      throw error;
    }

    if (!internationalData.is_visible) {
      return NextResponse.json({
        is_visible: false,
        title: "GLUE International is not yet available.",
        subtitle: "GLUE International is not yet available.",
        button_text: "GLUE International is not yet available.",
        website: "http://glue-international.com",
        button_color: "#10069F",
      });
    }

    const internationalTransformedData = {
      title: internationalData.title,
      subtitle: internationalData.subtitle,
      button_text: internationalData.button_text,
      website: internationalData.website,
      button_color: internationalData.button_color,
      is_visible: internationalData.is_visible,
    };

    return NextResponse.json(internationalTransformedData);
  } catch (error) {
    console.error("Error in GET /api/admin/about/international", error);
    return NextResponse.json(
      { error: "An error occurred while fetching international content data" },
      { status: 500 }
    );
  }
}
