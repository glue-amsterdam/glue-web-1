import { infoSectionClientSchema } from "@/schemas/infoSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: infoData }, { data: infoItemsData }] = await Promise.all([
      supabase
        .from("about_info")
        .select("*")
        .eq("id", "about-info-56ca13952fcc")
        .single(),
      supabase
        .from("about_info_items")
        .select("id, title, description, image_url, alt")
        .eq("info_id", "about-info-56ca13952fcc")
        .order("created_at"),
    ]);

    if (!infoData || !infoItemsData) {
      throw new Error("Failed to fetch info section data or items");
    }

    if (!infoData) {
      throw new Error("Failed to fetch info section data");
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
          alt: item.alt,
        },
      })),
    };

    const validatedData = infoSectionClientSchema.parse(infoSection);

    return NextResponse.json(validatedData);

    return NextResponse.json(infoSection);
  } catch (error) {
    console.error("Error in GET /api/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching info section data" },
      { status: 500 }
    );
  }
}
