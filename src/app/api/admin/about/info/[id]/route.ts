import { infoItemSchema } from "@/schemas/baseSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const supabase = await createClient();

  try {
    const body = await request.json();

    // Validate the incoming data
    const validatedData = infoItemSchema.parse(body);

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
    console.error(
      `Error in PUT /api/admin/about/info-item/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "An error occurred while updating the info item" },
      { status: 500 }
    );
  }
}
