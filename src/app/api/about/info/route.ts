import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { InfoItem, InfoSectionContent } from "@/schemas/baseSchema";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: infoData, error } = await supabase
      .from("about_info")
      .select("*")
      .eq("id", "about-info-56ca13952fcc")
      .single();

    if (error) throw error;

    if (!infoData) {
      throw new Error("Failed to fetch info section data");
    }

    const infoSection: InfoSectionContent = {
      title: infoData.title,
      description: infoData.description,
      infoItems: infoData.info_items.map((item: InfoItem) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        image: {
          image_url: item.image.image_url,
          alt: item.image.alt,
        },
      })),
    };

    return NextResponse.json(infoSection);
  } catch (error) {
    console.error("Error in GET /api/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching info section data" },
      { status: 500 }
    );
  }
}
