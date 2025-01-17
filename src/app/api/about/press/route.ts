import { PressItemsSectionContent } from "@/schemas/pressSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: pressData }, { data: pressItemsData }] = await Promise.all([
      supabase.from("about_press").select("*").single(),
      supabase.from("about_press_items").select("*").order("created_at"),
    ]);

    if (!pressData) {
      throw new Error("Failed to fetch press section data");
    }

    const pressSection: PressItemsSectionContent = {
      title: pressData.title,
      description: pressData.description,
      pressItems:
        pressItemsData?.map(
          ({ id, title, description, image_url, alt, is_visible }) => ({
            id,
            title,
            description,
            image_url,
            alt,
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
