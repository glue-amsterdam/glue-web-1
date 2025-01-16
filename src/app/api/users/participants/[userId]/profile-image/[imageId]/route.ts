import { config } from "@/env";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const imageSchema = z.object({
  image_url: z.string().url(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string; imageId: string }> }
) {
  const { userId, imageId } = await params;
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { image_url } = imageSchema.parse(body);

    const { error } = await supabase
      .from("participant_image")
      .update({ image_url })
      .match({ id: imageId, user_id: userId });

    if (error) throw error;

    return NextResponse.json({
      id: imageId,
      message: "Image updated successfully",
    });
  } catch (error) {
    console.error(
      `Error updating profile image ${imageId} for user ${userId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; imageId: string }> }
) {
  const { userId, imageId } = await params;
  const supabase = await createClient();

  try {
    // Delete the image record from the database
    const { data, error } = await supabase
      .from("participant_image")
      .delete()
      .match({ id: imageId, user_id: userId })
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      // Delete the image from storage
      const imageUrl = data[0].image_url;
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const filename = pathParts[pathParts.length - 1];
      const filePath = `profile-images/${userId}/${filename}`;

      const { error: storageError } = await supabase.storage
        .from(config.bucketName)
        .remove([filePath]);

      if (storageError) {
        console.error(
          `Failed to delete image from storage: ${filePath}`,
          storageError
        );
      }
    }

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(
      `Error deleting profile image ${imageId} for user ${userId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to delete profile image" },
      { status: 500 }
    );
  }
}
