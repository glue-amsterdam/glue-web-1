import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: infoData, error: headerError } = await supabase
      .from("about_info")
      .select("*")
      .eq("id", "about-info")
      .single();

    if (headerError) {
      throw new Error("Failed to fetch info header section data");
    }

    if (!infoData.is_visible) {
      return NextResponse.json({
        title: "No info items",
        description: "Press items not visible by now",
        is_visible: false,
        infoItems: [],
      });
    }

    const { data: infoItemsData, error: InfoItemsError } = await supabase
      .from("about_info_items")
      .select("*")
      .eq("is_visible", true)
      .order("id");

    if (InfoItemsError) {
      throw new Error(`Failed to fetch info items: ${InfoItemsError.message}`);
    }

    const infoSection = {
      title: infoData.title,
      description: infoData.description,
      is_visible: infoData.is_visible,
      infoItems: infoItemsData.map((item) => ({
        description: item.description,
        id: item.id,
        title: item.title,
        image_url: item.image_url,
      })),
    };

    return NextResponse.json(infoSection);
  } catch (error) {
    console.error("Error in GET /api/about/info:", error);

    return NextResponse.json(
      { error: "Failed to fetch info section data" },
      { status: 500 }
    );
  }
}
