import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { participantDetailsSchema } from "@/schemas/participantDetailsSchemas";
import { mapInfoSchema } from "@/schemas/mapInfoSchemas";

function isValidUUID(uuid: string | null | undefined) {
  return typeof uuid === "string" && /^[0-9a-fA-F-]{36}$/.test(uuid);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

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
          { error: "Invalid participantDetails", details: err.errors },
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
          { error: "Invalid mapInfo", details: err.errors },
          { status: 400 }
        );
      }
      throw err;
    }

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

    let plan_id = null;
    let plan_type = null;
    if (
      participantDetails.reactivation_notes &&
      isValidUUID(participantDetails.reactivation_notes.plan_id)
    ) {
      plan_id = participantDetails.reactivation_notes.plan_id;
    }
    if (
      participantDetails.reactivation_notes &&
      typeof participantDetails.reactivation_notes.plan_type === "string"
    ) {
      plan_type = participantDetails.reactivation_notes.plan_type;
    }
    if (plan_id || plan_type) {
      const updateObj: Partial<{ plan_id: string; plan_type: string }> = {};
      if (plan_id) updateObj.plan_id = plan_id;
      if (plan_type) updateObj.plan_type = plan_type;
      const { error: userInfoError } = await supabase
        .from("user_info")
        .update(updateObj)
        .eq("user_id", userId);
      if (userInfoError) {
        return NextResponse.json(
          {
            error: "Failed to update user_info with plan",
            details: userInfoError,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      participantDetails: participantData,
      mapInfo: mapInfoData,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
