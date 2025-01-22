import type { CarouselClientType } from "@/schemas/carouselSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch carousel data first
    const { data: carouselData, error: carouselError } = await supabase
      .from("about_carousel")
      .select("title,description,is_visible")
      .eq("id", "about-carousel")
      .single();

    if (carouselError) {
      console.error("Error fetching carousel data:", carouselError);
      throw carouselError;
    }

    // If not visible, return early with empty data
    if (!carouselData.is_visible) {
      const emptyCarouselSection: CarouselClientType = {
        title: "",
        description: "",
        is_visible: false,
        slides: [],
      };
      return NextResponse.json(emptyCarouselSection);
    }

    // Fetch slides data only if carousel is visible
    const { data: slidesData, error: slidesError } = await supabase
      .from("about_carousel_slides")
      .select("image_url")
      .eq("carousel_id", "about-carousel");

    if (slidesError) {
      console.error("Error fetching slides data:", slidesError);
      throw slidesError;
    }

    if (!slidesData) {
      return NextResponse.json(
        { error: "No slides data found" },
        { status: 404 }
      );
    }

    const carouselSection: CarouselClientType = {
      title: carouselData.title,
      description: carouselData.description,
      is_visible: carouselData.is_visible,
      slides: slidesData.map((slide) => ({
        image_url: slide.image_url,
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
    } else {
      // In development, return more detailed error information
      return NextResponse.json(
        {
          error: "Failed to fetch carousel data",
          details: (error as Error).message,
        },
        {
          status: 500,
        }
      );
    }
  }
}
