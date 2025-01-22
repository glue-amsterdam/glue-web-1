import type { PressItemsSectionContent } from "@/schemas/pressSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Move the schema definition outside of any exported function
const pressHeaderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_visible: z.boolean(),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: pressData, error: headerError } = await supabase
      .from("about_press")
      .select("*")
      .single();

    if (!pressData || headerError) {
      throw new Error("Failed to fetch press section data");
    }

    const { data: pressItemsData } = await supabase
      .from("about_press_items")
      .select("*")
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

    const validatedData = pressHeaderSchema.parse(body);

    const { error: pressError } = await supabase
      .from("about_press")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
        is_visible: validatedData.is_visible,
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
