import {
  CarouselSection,
  carouselSectionSchema,
} from "@/schemas/carouselSchema";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    const carouselSection: Pick<
      CarouselSection,
      "title" | "description" | "slides"
    > = {
      title: carouselData.title,
      description: carouselData.description,
      slides: slidesData.map(({ id, image_url, alt, image_name }) => ({
        id,
        image_url,
        alt,
        image_name,
      })),
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
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
  const supabase = await createClient();
  try {
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

    // Get existing slides
    const { data: existingSlides, error: fetchError } = await supabase
      .from("about_carousel_slides")
      .select("id, image_url")
      .eq("carousel_id", "about-carousel-56ca13952fcc");

    if (fetchError) throw fetchError;

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

    // Identify slides to be deleted
    const currentSlideIds = validatedData.slides.map((slide) => slide.id);
    const slidesToDelete = existingSlides?.filter(
      (slide) => !currentSlideIds.includes(slide.id)
    );

    if (slidesToDelete && slidesToDelete.length > 0) {
      // Delete slides from the database
      const { error: deleteError } = await supabase
        .from("about_carousel_slides")
        .delete()
        .in(
          "id",
          slidesToDelete.map((slide) => slide.id)
        );

      if (deleteError) throw deleteError;

      // Delete corresponding images from the storage bucket
      for (const slide of slidesToDelete) {
        try {
          const url = new URL(slide.image_url);
          const pathParts = url.pathname.split("/");
          const filename = pathParts[pathParts.length - 1];
          const filePath = `about/carousel-images/${filename}`;

          console.log(`Attempting to delete image: ${filePath}`);

          const { error: storageError } = await supabase.storage
            .from("amsterdam-assets")
            .remove([filePath]);

          if (storageError) {
          } else {
          }
        } catch (error) {}
      }
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
