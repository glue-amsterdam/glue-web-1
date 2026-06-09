import { filterParticipantDetailsPayload } from "@/lib/participants/filter-participant-details-payload";
import { guardParticipantProfileWrite } from "@/lib/participants/guard-participant-profile-write";
import {
  resolvePlanTypeFromPlanId,
  syncParticipantContactToUserInfo,
} from "@/lib/participants/sync-participant-to-user-info";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { participantDetailsSchema } from "@/schemas/participantDetailsSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("participant_details")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "user info not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching participant details:", error);
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "user info not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

const applyReactivationSideEffects = (data: ParticipantDetails) => {
  if (data.reactivation_status === "declined") {
    data.is_active = false;
  } else if (data.reactivation_status === "pending") {
    data.reactivation_requested = true;
  }
};

const resolvePlanType = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: ParticipantDetails
): Promise<ParticipantDetails> => {
  if (!data.plan_id) {
    return data;
  }

  if (data.plan_type) {
    return data;
  }

  const planType = await resolvePlanTypeFromPlanId(supabase, data.plan_id);
  if (planType) {
    data.plan_type = planType;
  }

  return data;
};

async function handleRequest(
  request: Request,
  userId: string,
  action: "update" | "create"
) {
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const denied = await guardParticipantProfileWrite(userId);
  if (denied) return denied;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isMod = await getIsPlatformMod(supabase, user.id);

    const body = await request.json();
    const parsed = participantDetailsSchema.parse(body);

    let existing: ParticipantDetails | null = null;
    if (action === "update") {
      const { data } = await supabase
        .from("participant_details")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      existing = data as ParticipantDetails | null;
    }

    let validatedData = filterParticipantDetailsPayload(parsed, existing, isMod);
    validatedData = await resolvePlanType(supabase, validatedData);

    if (action === "update") {
      applyReactivationSideEffects(validatedData);

      const { data, error } = await supabase
        .from("participant_details")
        .update(validatedData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating participant details:", error);
        return NextResponse.json(
          { error: "Failed to update participant details" },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Participant details not found" },
          { status: 404 }
        );
      }

      const { error: syncError } = await syncParticipantContactToUserInfo(
        supabase,
        userId,
        {
          plan_id: data.plan_id,
          plan_type: data.plan_type,
          display_name: data.display_name,
          phone_numbers: data.phone_numbers,
          social_media: data.social_media,
          visible_emails: data.visible_emails,
          visible_websites: data.visible_websites,
          glue_communication_email: data.glue_communication_email,
        }
      );

      if (syncError) {
        return NextResponse.json(
          { error: "Failed to sync user info", details: syncError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("participant_details")
      .insert({ ...validatedData, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Error creating participant details:", error);
      return NextResponse.json(
        { error: "Failed to create participant details" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Participant details not found" },
        { status: 404 }
      );
    }

    const { error: syncError } = await syncParticipantContactToUserInfo(
      supabase,
      userId,
      {
        plan_id: data.plan_id,
        plan_type: data.plan_type,
        display_name: data.display_name,
        phone_numbers: data.phone_numbers,
        social_media: data.social_media,
        visible_emails: data.visible_emails,
        visible_websites: data.visible_websites,
        glue_communication_email: data.glue_communication_email,
      }
    );

    if (syncError) {
      return NextResponse.json(
        { error: "Failed to sync user info", details: syncError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Zod validation error:", error.issues);
      return NextResponse.json(
        { error: "Invalid participant data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return handleRequest(request, userId, "create");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return handleRequest(request, userId, "update");
}
