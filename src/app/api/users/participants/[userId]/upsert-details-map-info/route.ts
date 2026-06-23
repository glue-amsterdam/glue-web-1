import { guardParticipantProfileWrite } from "@/lib/participants/guard-participant-profile-write";
import {
  revalidateExhibitorSlugPaths,
  revalidateParticipantVisibilityCaches,
} from "@/lib/participants/revalidate-participant-visibility-caches";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { participantDetailsSchema } from "@/schemas/participantDetailsSchemas";
import { mapInfoSchema } from "@/schemas/mapInfoSchemas";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const denied = await guardParticipantProfileWrite(userId);
  if (denied) return denied;

  try {
    const supabase = await createClient();
    const body = await request.json();

    let participantDetails, mapInfo;
    try {
      participantDetails = participantDetailsSchema.parse(
        body.participantDetails
      );
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid participantDetails", details: err.issues },
          { status: 400 }
        );
      }
      throw err;
    }
    try {
      mapInfo = mapInfoSchema.parse(body.mapInfo);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid mapInfo", details: err.issues },
          { status: 400 }
        );
      }
      throw err;
    }

    const { data: existingDetails } = await supabase
      .from("participant_details")
      .select("slug")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: participantData, error: participantError } = await supabase
      .from("participant_details")
      .update(participantDetails)
      .eq("user_id", userId)
      .select()
      .single();

    if (participantError) {
      return NextResponse.json(
        {
          error: "Failed to update participant details",
          details: participantError,
        },
        { status: 500 }
      );
    }

    let { data: mapInfoData, error: mapInfoError } = await supabase
      .from("map_info")
      .update(mapInfo)
      .eq("user_id", userId)
      .select()
      .single();

    if (mapInfoError && mapInfoError.code === "PGRST116") {
      const insertResult = await supabase
        .from("map_info")
        .insert({ ...mapInfo, user_id: userId })
        .select()
        .single();
      mapInfoData = insertResult.data;
      mapInfoError = insertResult.error;
    }

    if (mapInfoError) {
      return NextResponse.json(
        { error: "Failed to update/insert map info", details: mapInfoError },
        { status: 500 }
      );
    }

    await revalidateParticipantVisibilityCaches(supabase);
    revalidateExhibitorSlugPaths(
      existingDetails?.slug,
      (participantData as ParticipantDetails).slug
    );

    return NextResponse.json({
      participantDetails: participantData,
      mapInfo: mapInfoData,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
