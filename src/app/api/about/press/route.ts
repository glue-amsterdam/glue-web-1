import { PressItemsSectionContent } from "@/schemas/pressSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: pressData, error: headerError } = await supabase
      .from("about_press")
      .select("*")
      .single();

    if (headerError) {
      throw new Error("Failed to fetch press header section data");
    }

    if (!pressData.is_visible) {
      return NextResponse.json({
        title: "No press items",
        description: "Press items not visible by now",
        is_visible: false,
        text_color: "#ffffff",
        background_color: "#000000",
        pressItems: [],
      });
    }

    const { data: pressItemsData, error: pressItemError } = await supabase
      .from("about_press_items")
      .select("*")
      .eq("is_visible", true)
      .order("id");

    if (pressItemError) {
      throw new Error(`Failed to fetch info items: ${pressItemError.message}`);
    }

    const pressSection: PressItemsSectionContent = {
      title: pressData.title,
      description: pressData.description,
      is_visible: pressData.is_visible,
      text_color: pressData.text_color,
      background_color: pressData.background_color,
      pressItems:
        pressItemsData?.map(
          ({ id, title, description, image_url, is_visible }) => ({
            id,
            title,
            description,
            image_url,
            isVisible: is_visible,
          })
        ) || [],
    };

    return NextResponse.json(pressSection);
  } catch (error) {
    console.error("Error in GET /api/admin/about/press:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching press section data" },
      { status: 500 }
    );
  }
}
