import { InfoSection, infoSectionHeaderSchema } from "@/schemas/infoSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: infoData }, { data: infoItemsData }] = await Promise.all([
      supabase.from("about_info").select("*").single(),
      supabase.from("about_info_items").select("*").order("created_at"),
    ]);

    if (!infoData || !infoItemsData) {
      throw new Error("Failed to fetch info section data or items");
    }

    const infoSection: InfoSection = {
      title: infoData.title,
      description: infoData.description,
      infoItems: infoItemsData.map(
        ({ id, title, description, image_url, alt, image_name }) => ({
          id,
          title,
          description,
          image: { image_url, alt, image_name: image_name || "" },
        })
      ),
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
      })
      .eq("id", "about-info-56ca13952fcc");

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
