import { CarouselClientType } from "@/schemas/baseSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: carouselData }, { data: slidesData }] = await Promise.all([
      supabase.from("about_carousel").select("title,description").single(),
      supabase.from("about_carousel_slides").select("image_url,alt"),
    ]);

    if (!carouselData || !slidesData) {
      throw new Error(
        "Failed to fetch carousel data or slides in client api call"
      );
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
      {
        error:
          "An error occurred while fetching carousel data in client api call",
      },
      { status: 500 }
    );
  }
}
