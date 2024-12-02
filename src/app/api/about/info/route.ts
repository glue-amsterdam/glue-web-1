import { InfoSection } from "@/schemas/infoSchema";
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
      supabase.from("about_info_items").select("*").order("created_at"),
    ]);

    if (!infoData || !infoItemsData) {
      throw new Error("Failed to fetch info section data or items");
    }

    if (!infoData) {
      throw new Error("Failed to fetch info section data");
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
    console.error("Error in GET /api/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching info section data" },
      { status: 500 }
    );
  }
}
