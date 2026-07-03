import { revalidateHomeCitizensCache } from "@/lib/home";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import { NextResponse } from "next/server";
import { citizenSchema } from "@/schemas/citizenSchema";
import { config } from "@/config";

export async function GET(
  request: Request,
  props: { params: Promise<{ year: string; citizenId: string }> }
) {
  const params = await props.params;
  const { year, citizenId } = params;

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const { data, error } = await auth.supabase
      .from("about_citizens")
      .select("*")
      .eq("id", citizenId)
      .eq("year", year)
      .single();

    if (error) throw error;

    return NextResponse.json({
      citizen: data ? { ...data, image_url: toMediaUrl(data.image_url) } : data,
    });
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
  const { year, citizenId } = params;

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const body = await request.json();

    // Validate the incoming data
    const validatedData = citizenSchema.parse(body);

    // Get existing citizen to check for image changes
    const { data: existingCitizen, error: fetchError } = await auth.supabase
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
      image_url: toMediaKey(validatedData.image_url),
      image_name: validatedData.image_name,
      year,
      section_id: "about-citizens-section",
    };

    // Update the citizen
    const { error: updateError, data: updatedCitizen } = await auth.supabase
      .from("about_citizens")
      .update(citizenToUpdate)
      .eq("id", citizenId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Handle image deletion if image changed. Stored values are bucket-relative
    // keys; the incoming URL is normalized to a key for an accurate comparison.
    const existingKey = toMediaKey(existingCitizen?.image_url);
    const nextKey = toMediaKey(validatedData.image_url);
    if (existingKey && existingKey !== nextKey) {
      try {
        const { error: storageError } = await auth.supabase.storage
          .from(config.bucketName)
          .remove([existingKey]);

        if (storageError) {
          console.error(
            `Failed to delete old image: ${existingKey}`,
            storageError
          );
        } else {
          console.log(`Successfully deleted old image: ${existingKey}`);
        }
      } catch (error) {
        console.error(
          `Error processing old image deletion: ${existingKey}`,
          error
        );
      }
    }

    revalidateHomeCitizensCache(Number(year));

    return NextResponse.json({
      message: `Citizen ${citizenId} for year ${year} updated successfully`,
      citizen: updatedCitizen
        ? { ...updatedCitizen, image_url: toMediaUrl(updatedCitizen.image_url) }
        : updatedCitizen,
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
  const { year, citizenId } = params;

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    // Get citizen to delete image
    const { data: citizen, error: fetchError } = await auth.supabase
      .from("about_citizens")
      .select("image_url")
      .eq("id", citizenId)
      .eq("year", year)
      .single();

    if (fetchError) throw fetchError;

    // Delete citizen from database
    const { error: deleteError } = await auth.supabase
      .from("about_citizens")
      .delete()
      .eq("id", citizenId)
      .eq("year", year);

    if (deleteError) throw deleteError;

    // Delete image from storage if exists (stored value is a bucket-relative key).
    const citizenKey = toMediaKey(citizen?.image_url);
    if (citizenKey) {
      try {
        const { error: storageError } = await auth.supabase.storage
          .from(config.bucketName)
          .remove([citizenKey]);

        if (storageError) {
          console.error(`Failed to delete image: ${citizenKey}`, storageError);
        } else {
          console.log(`Successfully deleted image: ${citizenKey}`);
        }
      } catch (error) {
        console.error(
          `Error processing image deletion: ${citizenKey}`,
          error
        );
      }
    }

    revalidateHomeCitizensCache(Number(year));

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
