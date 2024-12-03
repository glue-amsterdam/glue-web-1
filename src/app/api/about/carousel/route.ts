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
      supabase
        .from("about_carousel")
        .select("title,description")
        .eq("id", "about-carousel-56ca13952fcc")
        .single(),
      supabase
        .from("about_carousel_slides")
        .select("image_url,alt")
        .eq("carousel_id", "about-carousel-56ca13952fcc"),
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

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "Failed to fetch carousel data",
        },
        {
          status: 500,
        }
      );
    }
  }
}
