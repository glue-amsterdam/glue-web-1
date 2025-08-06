import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { citizenSchema } from "@/schemas/citizenSchema";
import { config } from "@/env";

export async function GET(
  request: Request,
  props: { params: Promise<{ year: string; citizenId: string }> }
) {
  const params = await props.params;
  const { year, citizenId } = params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_citizens")
      .select("*")
      .eq("id", citizenId)
      .eq("year", year)
      .single();

    if (error) throw error;

    return NextResponse.json({ citizen: data });
  } catch (error) {
    console.error(
      `Error fetching citizen ${citizenId} for year ${year}:`,
      error
    );
    return NextResponse.json(
      { error: `Failed to fetch citizen for year ${year}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ year: string; citizenId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { year, citizenId } = params;

  try {
    const body = await request.json();

    // Validate the incoming data
    const validatedData = citizenSchema.parse(body);

    // Get existing citizen to check for image changes
    const { data: existingCitizen, error: fetchError } = await supabase
      .from("about_citizens")
      .select("id, image_url")
      .eq("id", citizenId)
      .eq("year", year)
      .single();

    if (fetchError) throw fetchError;

    // Prepare citizen data for update
    const citizenToUpdate = {
      id: citizenId,
      name: validatedData.name,
      description: validatedData.description,
      image_url: validatedData.image_url,
      image_name: validatedData.image_name,
      year,
      section_id: "about-citizens-section",
    };

    // Update the citizen
    const { error: updateError, data: updatedCitizen } = await supabase
      .from("about_citizens")
      .update(citizenToUpdate)
      .eq("id", citizenId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Handle image deletion if image changed
    if (
      existingCitizen?.image_url &&
      existingCitizen.image_url !== validatedData.image_url
    ) {
      try {
        const url = new URL(existingCitizen.image_url);
        const pathParts = url.pathname.split("/");
        const filename = pathParts[pathParts.length - 1];
        const filePath = `about/citizens/${year}/${filename}`;

        console.log(`Attempting to delete old image: ${filePath}`);

        const { error: storageError } = await supabase.storage
          .from(config.bucketName)
          .remove([filePath]);

        if (storageError) {
          console.error(
            `Failed to delete old image: ${filePath}`,
            storageError
          );
        } else {
          console.log(`Successfully deleted old image: ${filePath}`);
        }
      } catch (error) {
        console.error(
          `Error processing old image deletion: ${existingCitizen.image_url}`,
          error
        );
      }
    }

    return NextResponse.json({
      message: `Citizen ${citizenId} for year ${year} updated successfully`,
      citizen: updatedCitizen,
    });
  } catch (error) {
    console.error(
      `Error in PUT /admin/about/citizens/${year}/${citizenId}:`,
      error
    );
    return NextResponse.json(
      { error: `An error occurred while updating citizen for year ${year}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ year: string; citizenId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { year, citizenId } = params;

  try {
    // Get citizen to delete image
    const { data: citizen, error: fetchError } = await supabase
      .from("about_citizens")
      .select("image_url")
      .eq("id", citizenId)
      .eq("year", year)
      .single();

    if (fetchError) throw fetchError;

    // Delete citizen from database
    const { error: deleteError } = await supabase
      .from("about_citizens")
      .delete()
      .eq("id", citizenId)
      .eq("year", year);

    if (deleteError) throw deleteError;

    // Delete image from storage if exists
    if (citizen?.image_url) {
      try {
        const url = new URL(citizen.image_url);
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
        console.error(
          `Error processing image deletion: ${citizen.image_url}`,
          error
        );
      }
    }

    return NextResponse.json({
      message: `Citizen ${citizenId} for year ${year} deleted successfully`,
    });
  } catch (error) {
    console.error(
      `Error in DELETE /admin/about/citizens/${year}/${citizenId}:`,
      error
    );
    return NextResponse.json(
      { error: `An error occurred while deleting citizen for year ${year}` },
      { status: 500 }
    );
  }
}
