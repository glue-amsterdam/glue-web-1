import { guardParticipantProfileWrite } from "@/lib/participants/guard-participant-profile-write";
import { getPlanMaxImagesForUser } from "@/lib/plans/get-plan-max-images-for-user";
import { createClient } from "@/utils/supabase/server";import { NextResponse } from "next/server";
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

  const denied = await guardParticipantProfileWrite(userId);
  if (denied) return denied;

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { image_url } = imageSchema.parse(body);

    const [planMaxImages, { count, error: countError }] = await Promise.all([
      getPlanMaxImagesForUser(userId),
      supabase
        .from("participant_image")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    if (countError) throw countError;

    if ((count ?? 0) >= planMaxImages) {
      return NextResponse.json(
        {
          error: `Your plan allows up to ${planMaxImages} profile image${planMaxImages === 1 ? "" : "s"}.`,
        },
        { status: 403 }
      );
    }

    const newImage = {      id: crypto.randomUUID(),
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
