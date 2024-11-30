import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { CarouselSectionContent } from "@/schemas/baseSchema";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: carouselData }, { data: slidesData }] = await Promise.all([
      supabase.from("about_carousel").select("*").single(),
      supabase.from("about_carousel_slides").select("*").order("created_at"),
    ]);

    if (!carouselData || !slidesData) {
      throw new Error("Failed to fetch carousel data or slides");
    }

    const carouselSection: CarouselSectionContent = {
      title: carouselData.title,
      description: carouselData.description,
      slides: slidesData,
    };

    return NextResponse.json(carouselSection);
  } catch (error) {
    console.error("Error in GET /admin/about/carousel:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching carousel data" },
      { status: 500 }
    );
  }
}
