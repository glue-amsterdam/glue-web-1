import { InfoSection, infoSectionHeaderSchema } from "@/schemas/infoSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: infoData, error: headerError } = await supabase
      .from("about_info")
      .select("*")
      .single();

    if (!infoData || headerError) {
      throw new Error("Failed to fetch press section data");
    }

    const { data: infoItemsData } = await supabase
      .from("about_info_items")
      .select("*")
      .order("id");

    const infoSection: InfoSection = {
      title: infoData.title,
      description: infoData.description,
      is_visible: infoData.is_visible,
      infoItems:
        infoItemsData?.map(
          ({ id, title, description, image_url, is_visible }) => ({
            id,
            title,
            description,
            image_url,
            is_visible,
          })
        ) || [],
    };

    return NextResponse.json(infoSection);
  } catch (error) {
    console.error("Error in GET /admin/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching info section data" },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  const supabase = await createClient();
  try {
    const body = await request.json();

    const validatedData = infoSectionHeaderSchema.parse(body);

    const { error: infoError } = await supabase
      .from("about_info")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
        is_visible: validatedData.is_visible,
      })
      .eq("id", "about-info");

    if (infoError) throw infoError;

    return NextResponse.json({ message: "Main info updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/admin/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while updating main info data" },
      { status: 500 }
    );
  }
}
