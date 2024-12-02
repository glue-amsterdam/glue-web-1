import { CarouselClientType } from "@/schemas/baseSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [
      { data: carouselData, error: carouselError },
      { data: slidesData, error: slidesError },
    ] = await Promise.all([
      supabase.from("about_carousel").select("title,description").single(),
      supabase.from("about_carousel_slides").select("image_url,alt"),
    ]);

    if (carouselError || slidesError) {
      throw new Error(
        `Failed to fetch data: ${
          carouselError?.message || slidesError?.message
        }`
      );
    }

    if (!carouselData || !slidesData) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const carouselSection: CarouselClientType = {
      title: carouselData.title,
      description: carouselData.description,
      slides: slidesData.map((slide) => ({
        image_url: slide.image_url,
        alt: slide.alt,
      })),
    };

    return NextResponse.json(carouselSection);
  } catch (error) {
    console.error("Error in GET /api/about/carousel:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching carousel data" },
      { status: 500 }
    );
  }
}
