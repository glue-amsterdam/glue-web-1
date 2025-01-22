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
      throw new Error("Failed to fetch press section data");
    }

    if (!pressData.is_visible) {
      return NextResponse.json({
        title: "No press items",
        description: "Press items not visible by now",
        is_visible: false,
        pressItems: [],
      });
    }

    const { data: pressItemsData } = await supabase
      .from("about_press_items")
      .select("*")
      .eq("is_visible", true)
      .order("created_at");

    const pressSection: PressItemsSectionContent = {
      title: pressData.title,
      description: pressData.description,
      is_visible: pressData.is_visible,
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
