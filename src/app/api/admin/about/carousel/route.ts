import { config } from "@/config";
import { carouselSectionSchema } from "@/schemas/carouselSchema";
import { toMediaKey } from "@/lib/media/media-url";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
        id: "about-carousel",
        title: validatedData.title,
        description: validatedData.description,
        is_visible: validatedData.is_visible,
        text_color: validatedData.text_color,
      });

    if (carouselError) {
      console.error("Error updating main carousel data:", carouselError);
      throw new Error(
        `Failed to update main carousel data: ${carouselError.message}`
      );
    }

    // Get existing slides
    const { data: existingSlides, error: fetchError } = await supabase
      .from("about_carousel_slides")
      .select("id, image_url")
      .eq("carousel_id", "about-carousel");

    if (fetchError) {
      console.error("Error fetching existing slides:", fetchError);
      throw new Error(`Failed to fetch existing slides: ${fetchError.message}`);
    }

    // Prepare new slides data (persist bucket-relative keys)
    const newSlidesData = validatedData.slides.map((slide) => ({
      carousel_id: "about-carousel",
      image_url: toMediaKey(slide.image_url),
      image_name: slide.image_name,
    }));

    // Identify slides to be deleted (compare on keys; existing rows store keys)
    const currentSlideKeys = validatedData.slides.map((slide) =>
      toMediaKey(slide.image_url)
    );
    const slidesToDelete = existingSlides.filter(
      (slide) => !currentSlideKeys.includes(toMediaKey(slide.image_url))
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

      // Delete from storage (stored value is a bucket-relative key)
      const filePath = toMediaKey(slide.image_url);
      if (filePath) {
        try {
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
            `Error processing image deletion for ${filePath}:`,
            error
          );
          throw error;
        }
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
        throw new Error(`Failed to upsert slide: ${upsertError.message}`);
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
