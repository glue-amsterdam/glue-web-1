import { infoItemSchema } from "@/schemas/infoSchema";
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
    const validatedData = infoItemSchema.parse(body);

    // Delete old image if a new one is uploaded
    if (
      validatedData.image.oldImageUrl &&
      validatedData.image.image_url !== validatedData.image.oldImageUrl
    ) {
      const oldImagePath = new URL(validatedData.image.oldImageUrl).pathname
        .split("/")
        .pop();
      const { error: deleteError } = await supabase.storage
        .from("amsterdam-assets")
        .remove([`about/info-items/${oldImagePath}`]);

      if (deleteError) {
        console.error("Error deleting old image:", deleteError);
      }
    }

    // Update the info item
    const { error: itemError } = await supabase
      .from("about_info_items")
      .upsert({
        id: params.id,
        title: validatedData.title,
        description: validatedData.description,
        image_url: validatedData.image.image_url,
        alt: validatedData.image.alt,
        image_name: validatedData.image.image_name,
        info_id: "about-info-56ca13952fcc",
      });

    if (itemError) throw itemError;

    return NextResponse.json({ message: "Info item updated successfully" });
  } catch (error) {
    console.error(`Error in PUT /api/admin/about/info/${params.id}:`, error);
    return NextResponse.json(
      { error: "An error occurred while updating the info item" },
      { status: 500 }
    );
  }
}
