import { OpenCloseTime, VisitingHours } from "@/types/api-visible-user";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface ParticipantDetailsRow {
  user_id: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  status: string;
  display_name: string | null;
  plan_id: string | null;
  plan_type: string | null;
  phone_numbers: string[] | null;
  social_media: Record<string, string> | null;
  visible_emails: string[] | null;
  visible_websites: string[] | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createClient();

    const { data: tourStatus, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("current_tour_status")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
    }

    const currentTourStatus = tourStatus?.current_tour_status || "new";

    const { data: participantForStickyCheck, error: participantCheckError } =
      await supabase
        .from("participant_details")
        .select("user_id")
        .eq("slug", slug)
        .eq("status", "accepted")
        .single();

    if (participantCheckError) {
      if (participantCheckError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Participant not found" },
          { status: 404 }
        );
      }
      throw participantCheckError;
    }

    if (!participantForStickyCheck?.user_id) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    const { data: stickyData, error: stickyError } = await supabase
      .from("sticky_group_participants")
      .select("participant_user_id")
      .eq("participant_user_id", participantForStickyCheck.user_id);

    const isSticky = !stickyError && stickyData && stickyData.length > 0;

    let participantQuery = supabase
      .from("participant_details")
      .select(
        `
        user_id,
        slug,
        short_description,
        description,
        status,
        display_name,
        plan_id,
        plan_type,
        phone_numbers,
        social_media,
        visible_emails,
        visible_websites
      `
      )
      .eq("slug", slug)
      .eq("status", "accepted");

    if (!isSticky) {
      if (currentTourStatus === "new") {
        participantQuery = participantQuery.eq("is_active", true);
      } else if (currentTourStatus === "older") {
        participantQuery = participantQuery.or(
          "was_active_last_year.eq.true,is_active.eq.true"
        );
      }
    }

    const { data, error: participantError } = (await participantQuery.single()) as {
      data: ParticipantDetailsRow | null;
      error: PostgrestError;
    };

    if (participantError) {
      if (participantError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Participant not found" },
          { status: 404 }
        );
      }
      throw participantError;
    }

    if (!data?.user_id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 404 });
    }

    const displayName = getParticipantDisplayName(data);
    const isMod = await getIsPlatformMod(supabase, data.user_id);
    const planId = data.plan_id;

    const [imageData, mapInfo, visitingHoursData, events, legacyUserInfo] =
      await Promise.all([
        supabase
          .from("participant_image")
          .select("image_url")
          .eq("user_id", data.user_id),
        supabase
          .from("map_info")
          .select("formatted_address, id, no_address")
          .eq("user_id", data.user_id),
        supabase
          .from("visiting_hours")
          .select("day_id, hours")
          .eq("user_id", data.user_id),
        supabase
          .from("events")
          .select("id, image_url, title")
          .eq("organizer_id", data.user_id),
        supabase
          .from("user_info")
          .select("plan_id, plan_type")
          .eq("user_id", data.user_id)
          .maybeSingle(),
      ]);

    const transformedVisitingHours: VisitingHours = {
      hours:
        visitingHoursData.data?.reduce((acc, day) => {
          acc[day.day_id] = day.hours;
          return acc;
        }, {} as { [key: string]: OpenCloseTime[] }) || {},
    };

    const resolvedPlanId = planId ?? legacyUserInfo.data?.plan_id ?? null;

    let planData = null;
    if (resolvedPlanId) {
      const { data: planResult, error: planError } = await supabase
        .from("plans")
        .select("plan_label")
        .eq("plan_id", resolvedPlanId)
        .single();

      if (planError && planError.code !== "PGRST116") {
        throw planError;
      }

      planData = planResult;
    }

    const fullParticipantData = {
      ...data,
      is_sticky: isSticky,
      user_info: {
        user_name: displayName,
        is_mod: isMod,
        plan_id: resolvedPlanId ?? "",
        plan_type: data.plan_type ?? legacyUserInfo.data?.plan_type ?? "participant",
        phone_numbers: data.phone_numbers,
        social_media: data.social_media,
        visible_emails: data.visible_emails,
        visible_websites: data.visible_websites,
        map_info: mapInfo.data || [],
        visiting_hours: [transformedVisitingHours],
        events: events.data || [],
      },
      images: imageData.data || [],
      plan: planData,
    };

    return NextResponse.json(fullParticipantData, { status: 200 });
  } catch (error) {
    console.error("Error fetching participant data:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant data" },
      { status: 500 }
    );
  }
}
