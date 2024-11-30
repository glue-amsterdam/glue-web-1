import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import {
  CarouselSectionContent,
  carouselSectionSchema,
} from "@/schemas/baseSchema";

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate the incoming data
    const validatedData = carouselSectionSchema.parse(body);

    // Update the main carousel data
    const { error: carouselError } = await supabase
      .from("about_carousel")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
      })
      .eq("id", "about-carousel-56ca13952fcc");

    if (carouselError) throw carouselError;

    // Update the slides
    const { error: slidesError } = await supabase
      .from("about_carousel_slides")
      .upsert(
        validatedData.slides.map((slide) => ({
          id: slide.id,
          image_url: slide.image_url,
          alt: slide.alt,
          image_name: slide.image_name,
          carousel_id: "about-carousel-56ca13952fcc",
        }))
      );

    if (slidesError) throw slidesError;

    // Delete any slides that are no longer present
    const currentSlideIds = validatedData.slides.map((slide) => slide.id);
    const { error: deleteError } = await supabase
      .from("about_carousel_slides")
      .delete()
      .filter("id", "not.in", `(${currentSlideIds.join(",")})`);

    if (deleteError) {
      console.error("Error deleting old slides:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete old carousel slides" },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Carousel updated successfully" });
  } catch (error) {
    console.error("Error in POST /admin/about/carousel:", error);
    return NextResponse.json(
      { error: "An error occurred while updating carousel data" },
      { status: 500 }
    );
  }
}
