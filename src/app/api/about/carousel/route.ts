import { CarouselClientType } from "@/schemas/baseSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const CAROUSEL_FALLBACK_DATA: CarouselClientType = {
  title: "Welcome to GLUE",
  description: "Discover Amsterdam's vibrant design community",
  slides: [
    {
      image_url: "/placeholder.jpg",
      alt: "GLUE Amsterdam Design Community",
    },
    {
      image_url: "/placeholder.jpg",
      alt: "GLUE Events and Activities",
    },
    {
      image_url: "/placeholder.jpg",
      alt: "GLUE Community Members",
    },
  ],
};

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for carousel section during build");
      return NextResponse.json(CAROUSEL_FALLBACK_DATA);
    }

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
    } else {
      console.warn("Using fallback data for carousel");
      return NextResponse.json(CAROUSEL_FALLBACK_DATA);
    }
  }
}
