import { config } from "@/env";
import { pressItemSchema } from "@/schemas/pressSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();

  try {
    const body = await request.json();
    const validatedData = pressItemSchema.parse(body);

    // Delete old image if a new one is uploaded
    if (
      validatedData.oldImageUrl &&
      validatedData.image_url !== validatedData.oldImageUrl
    ) {
      const oldImagePath = new URL(validatedData.oldImageUrl).pathname
        .split("/")
        .pop();
      const { error: deleteError } = await supabase.storage
        .from(config.bucketName)
        .remove([`about/press-items/${oldImagePath}`]);

      if (deleteError) {
        console.error("Error deleting old image:", deleteError);
      }
    }

    // Update the press item
    const { error: itemError } = await supabase
      .from("about_press_items")
      .upsert({
        id: params.id,
        title: validatedData.title,
        description: validatedData.description,
        image_url: validatedData.image_url,
        alt: validatedData.alt,
        is_visible: validatedData.isVisible,
        press_id: "about-press",
      });

    if (itemError) throw itemError;

    return NextResponse.json({ message: "Press item updated successfully" });
  } catch (error) {
    console.error(`Error in PUT /api/admin/about/press/${params.id}:`, error);
    return NextResponse.json(
      { error: "An error occurred while updating the press item" },
      { status: 500 }
    );
  }
}
