import { infoSectionClientSchema } from "@/schemas/infoSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [
      { data: infoData, error: infoDataError },
      { data: infoItemsData, error: InfoItemsError },
    ] = await Promise.all([
      supabase.from("about_info").select("*").eq("id", "about-info").single(),
      supabase
        .from("about_info_items")
        .select("id, title, description, image_url")
        .order("id"),
    ]);

    if (!infoData || infoDataError) {
      throw new Error(
        `Failed to fetch info section data or items: ${infoDataError?.message}`
      );
    }

    if (!infoItemsData || InfoItemsError) {
      throw new Error(`Failed to fetch info items: ${InfoItemsError.message}`);
    }

    const infoSection = {
      title: infoData.title,
      description: infoData.description,
      infoItems: infoItemsData.map((item) => ({
        description: item.description,
        id: item.id,
        title: item.title,
        image: {
          image_url: item.image_url,
        },
      })),
    };

    const validatedData = infoSectionClientSchema.parse(infoSection);

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Error in GET /api/about/info:", error);

    return NextResponse.json(
      { error: "Failed to fetch info section data" },
      { status: 500 }
    );
  }
}
