import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { config } from "@/env";

const imageSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().url(),
});

const profileImagesSchema = z
  .array(imageSchema)
  .max(3, "You can only have up to 3 images");

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const { userId } = params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("participant_image")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");

    if (error) throw error;

    return NextResponse.json({ images: data });
  } catch (error) {
    console.error(`Error fetching profile images for user ${userId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch profile images for user ${userId}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { userId } = params;

  try {
    const body = await request.json();

    // Validate the incoming data
    const validatedData = profileImagesSchema.parse(body);

    // Get existing images for this user
    const { data: existingImages, error: fetchError } = await supabase
      .from("participant_image")
      .select("id, image_url")
      .eq("user_id", userId);

    if (fetchError) throw fetchError;

    // Prepare images data for upsert
    const imagesToUpsert = validatedData.map((image) => ({
      id: image.id || crypto.randomUUID(),
      user_id: userId,
      image_url: image.image_url,
    }));

    // Update the images
    const { error: imagesError } = await supabase
      .from("participant_image")
      .upsert(imagesToUpsert);

    if (imagesError) throw imagesError;

    // Identify images to be deleted (if any)
    const currentImageIds = imagesToUpsert.map((image) => image.id);
    const imagesToDelete = existingImages?.filter(
      (image) => !currentImageIds.includes(image.id)
    );

    if (imagesToDelete && imagesToDelete.length > 0) {
      // Delete images from the database
      const { error: deleteError } = await supabase
        .from("participant_image")
        .delete()
        .in(
          "id",
          imagesToDelete.map((image) => image.id)
        );

      if (deleteError) throw deleteError;

      // Delete corresponding images from the storage bucket
      for (const image of imagesToDelete) {
        try {
          const url = new URL(image.image_url);
          const pathParts = url.pathname.split("/");
          const filename = pathParts[pathParts.length - 1];
          const filePath = `profile-images/${userId}/${filename}`;

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
            `Error processing image deletion for image ${image.id}:`,
            error
          );
        }
      }
    }

    return NextResponse.json({
      message: `Profile images for user ${userId} updated successfully`,
    });
  } catch (error) {
    console.error(
      `Error in PUT /api/users/participants/${userId}/profile-image:`,
      error
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { userId } = params;

  try {
    // Delete profile images for the user
    const { error: deleteError } = await supabase
      .from("participant_image")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Delete corresponding images from the storage bucket
    const { data: images, error: fetchError } = await supabase.storage
      .from(config.bucketName)
      .list(`profile-images/${userId}`);

    if (fetchError) throw fetchError;

    if (images && images.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(config.bucketName)
        .remove(images.map((img) => `${userId}/${img.name}`));

      if (storageError) throw storageError;
    }

    return NextResponse.json({
      message: `Profile images for user ${userId} deleted successfully`,
    });
  } catch (error) {
    console.error(
      `Error in DELETE /api/users/participants/${userId}/profile-image:`,
      error
    );
    return NextResponse.json(
      {
        error: `An error occurred while deleting profile images for user ${userId}`,
      },
      { status: 500 }
    );
  }
}
