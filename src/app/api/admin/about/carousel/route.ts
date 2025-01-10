import { config } from "@/env";
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
        id: "about-carousel-56ca13952fcc",
        title: validatedData.title,
        description: validatedData.description,
      });

    if (carouselError) throw carouselError;

    // Get existing slides
    const { data: existingSlides, error: fetchError } = await supabase
      .from("about_carousel_slides")
      .select("id, image_url")
      .eq("carousel_id", "about-carousel-56ca13952fcc");

    if (fetchError) throw fetchError;

    // Prepare new slides data
    const newSlidesData = validatedData.slides.map((slide) => ({
      carousel_id: "about-carousel-56ca13952fcc",
      image_url: slide.image_url,
      alt: slide.alt,
      image_name: slide.image_name,
    }));

    // Identify slides to be deleted
    const currentSlideUrls = validatedData.slides.map(
      (slide) => slide.image_url
    );
    const slidesToDelete = existingSlides.filter(
      (slide) => !currentSlideUrls.includes(slide.image_url)
    );

    // Delete slides from the database and storage
    for (const slide of slidesToDelete) {
      // Delete from database
      const { error: deleteError } = await supabase
        .from("about_carousel_slides")
        .delete()
        .eq("id", slide.id);

      if (deleteError) {
        console.error(
          `Error deleting slide ${slide.id} from database:`,
          deleteError
        );
        throw deleteError;
      }

      // Delete from storage
      try {
        const url = new URL(slide.image_url);
        const pathParts = url.pathname.split("/");
        const filename = pathParts[pathParts.length - 1];
        const filePath = `about/carousel-images/${filename}`;

        console.log(`Attempting to delete image: ${filePath}`);

        const { error: storageError } = await supabase.storage
          .from(config.bucketName)
          .remove([filePath]);

        if (storageError) {
          console.error(`Error deleting image ${filePath}:`, storageError);
          throw storageError;
        } else {
          console.log(`Successfully deleted image: ${filePath}`);
        }
      } catch (error) {
        console.error(
          `Error processing image deletion for ${slide.image_url}:`,
          error
        );
        throw error;
      }
    }

    // Upsert new and updated slides
    for (const slide of newSlidesData) {
      const { error: upsertError } = await supabase
        .from("about_carousel_slides")
        .upsert(slide, { onConflict: "carousel_id,image_url" });

      if (upsertError) {
        console.error(
          `Error upserting slide: ${JSON.stringify(slide)}`,
          upsertError
        );
        throw upsertError;
      }
    }

    return NextResponse.json({ message: "Carousel updated successfully" });
  } catch (error) {
    console.error("Error in POST /api/admin/about/carousel:", error);
    return NextResponse.json(
      {
        error: "An error occurred while updating carousel data",
        details: error,
      },
      { status: 500 }
    );
  }
}
