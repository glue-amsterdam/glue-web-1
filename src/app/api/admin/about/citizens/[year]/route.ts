import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { citizenSchema } from "@/schemas/citizenSchema";
import { z } from "zod";
import { config } from "@/env";

export async function GET(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const { year } = params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_citizens")
      .select("*")
      .eq("year", year)
      .order("id");

    if (error) throw error;

    return NextResponse.json({ citizens: data });
  } catch (error) {
    console.error(`Error fetching citizens for year ${year}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch citizens for year ${year}` },
      { status: 500 }
    );
  }
}

const yearCitizensSchema = z.array(citizenSchema).min(3).max(4);

export async function PUT(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { year } = params;

  try {
    const body = await request.json();

    // Validate the incoming data
    const validatedData = yearCitizensSchema.parse(body);

    // Get existing citizens for this year
    const { data: existingCitizens, error: fetchError } = await supabase
      .from("about_citizens")
      .select("id, image_url")
      .eq("year", year)
      .eq("section_id", "about-citizens-section");

    if (fetchError) throw fetchError;

    // Prepare citizens data for upsert
    const citizensToUpsert = validatedData.map((citizen) => ({
      id: citizen.id,
      name: citizen.name,
      description: citizen.description,
      image_url: citizen.image_url,
      image_name: citizen.image_name,
      year,
      section_id: "about-citizens-section",
    }));

    // Update the citizens
    const { error: citizensError, data: upsertedCitizens } = await supabase
      .from("about_citizens")
      .upsert(citizensToUpsert);

    if (citizensError) throw citizensError;

    // Identify citizens to be deleted (if any)
    const currentCitizenIds = validatedData
      .map((citizen) => citizen.id)
      .filter(Boolean);
    const citizensToDelete = existingCitizens?.filter(
      (citizen) => !currentCitizenIds.includes(citizen.id)
    );

    // Identify images to be deleted
    const imagesToDelete = validatedData
      .filter(
        (citizen) =>
          citizen.oldImageUrl && citizen.oldImageUrl !== citizen.image_url
      )
      .map((citizen) => citizen.oldImageUrl);

    // Delete citizens from the database
    if (citizensToDelete && citizensToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("about_citizens")
        .delete()
        .in(
          "id",
          citizensToDelete.map((citizen) => citizen.id)
        );

      if (deleteError) throw deleteError;
    }

    // Delete old images from the storage bucket
    for (const imageUrl of imagesToDelete) {
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split("/");
          const filename = pathParts[pathParts.length - 1];
          const filePath = `about/citizens/${year}/${filename}`;

          console.log(`Attempting to delete image: ${filePath}`);

          const { error: storageError } = await supabase.storage
            .from(config.bucketName)
            .remove([filePath]);

          if (storageError) {
            console.error(`Failed to delete image: ${filePath}`, storageError);
          } else {
            console.log(`Successfully deleted image: ${filePath}`);
          }
        } catch (error) {
          console.error(`Error processing image deletion: ${imageUrl}`, error);
        }
      }
    }

    return NextResponse.json({
      message: `Citizens for year ${year} updated successfully`,
      citizens: upsertedCitizens,
    });
  } catch (error) {
    console.error(`Error in PUT /admin/about/citizens/${year}:`, error);
    return NextResponse.json(
      { error: `An error occurred while updating citizens for year ${year}` },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { year } = params;

  try {
    // Delete citizens for the year
    const { error: deleteError } = await supabase
      .from("about_citizens")
      .delete()
      .eq("year", year)
      .eq("section_id", "about-citizens-section");

    if (deleteError) throw deleteError;

    // Delete corresponding images from the storage bucket
    const { data: images, error: fetchError } = await supabase.storage
      .from(config.bucketName)
      .list(`about/citizens/${year}`);

    if (fetchError) throw fetchError;

    if (images && images.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(config.bucketName)
        .remove(images.map((img) => `about/citizens/${year}/${img.name}`));

      if (storageError) throw storageError;
    }

    return NextResponse.json({
      message: `Citizens and images for year ${year} deleted successfully`,
    });
  } catch (error) {
    console.error(`Error in DELETE /admin/about/citizens/${year}:`, error);
    return NextResponse.json(
      { error: `An error occurred while deleting citizens for year ${year}` },
      { status: 500 }
    );
  }
}
