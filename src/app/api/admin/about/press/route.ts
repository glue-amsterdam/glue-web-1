import {
  PressItemsSectionContent,
  pressItemsSectionSchema,
} from "@/schemas/pressSchema";
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
    console.error("Error in GET /admin/about/press:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching press section data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  try {
    const body = await request.json();

    const validatedData = pressItemsSectionSchema.parse(body);

    const { error: pressError } = await supabase
      .from("about_press")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
      })
      .eq("id", "about-press");

    if (pressError) throw pressError;

    return NextResponse.json({
      message: "Main press info updated successfully",
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/about/press:", error);
    return NextResponse.json(
      { error: "An error occurred while updating main press info data" },
      { status: 500 }
    );
  }
}
