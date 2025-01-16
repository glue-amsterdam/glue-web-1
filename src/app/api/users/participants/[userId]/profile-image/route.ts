import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

const imageSchema = z.object({
  image_url: z.string().url(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { image_url } = imageSchema.parse(body);

    const newImage = {
      id: crypto.randomUUID(),
      user_id: userId,
      image_url: image_url,
    };

    const { error } = await supabase
      .from("participant_image")
      .insert([newImage]);

    if (error) throw error;

    return NextResponse.json({
      id: newImage.id,
      message: "Image added successfully",
    });
  } catch (error) {
    console.error(`Error adding profile image for user ${userId}:`, error);
    return NextResponse.json(
      { error: "Failed to add profile image" },
      { status: 500 }
    );
  }
}
