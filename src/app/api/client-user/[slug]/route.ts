import { OpenCloseTime, VisitingHours } from "@/types/api-visible-user";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Define types for our data structures
interface UserInfo {
  user_name: string | null;
  is_mod: boolean;
  plan_id: string;
  plan_type: string;
  phone_numbers: string[] | null;
  social_media: Record<string, string> | null;
  visible_emails: string[] | null;
  visible_websites: string[] | null;
}

interface ParticipantDetails {
  user_id: string;
  slug: string;
  short_description: string;
  description: string | null;
  is_sticky: boolean;
  year: number | null;
  status: string;
  user_info: UserInfo;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createClient();

    // Fetch tour status to determine filtering logic
    const { data: tourStatus, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("current_tour_status")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
      // Default to "new" if tour status fetch fails
    }

    const currentTourStatus = tourStatus?.current_tour_status || "new";

    // First, get the participant by slug to check if they exist and get their user_id
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

    // Check if participant is sticky by looking at sticky_group_participants table
    const { data: stickyData, error: stickyError } = await supabase
      .from("sticky_group_participants")
      .select("participant_user_id")
      .eq("participant_user_id", participantForStickyCheck.user_id);

    // Determine if participant is sticky based on presence in sticky_group_participants
    // If stickyError is PGRST116 (no rows found), participant is not sticky
    // If stickyData has any rows, participant is sticky
    const isSticky = !stickyError && stickyData && stickyData.length > 0;

    // Build query based on tour status
    // Sticky participants are always accessible (no tour status filter)
    // Non-sticky participants must match tour status:
    // If "new": filter by is_active = true
    // If "older": filter by was_active_last_year = true OR is_active = true
    //   (This allows new active users to see their profile even in "older" mode,
    //   and previous year participants to remain visible)
    let participantQuery = supabase
      .from("participant_details")
      .select(
        `
        user_id,
        slug,
        short_description,
        description,
        status,
        user_info!inner(
          user_name,
          is_mod,
          plan_id,
          plan_type,
          phone_numbers,
          social_media,
          visible_emails,
          visible_websites
        )
      `
      )
      .eq("slug", slug)
      .eq("status", "accepted");

    // If not sticky, apply tour status filter
    if (!isSticky) {
      if (currentTourStatus === "new") {
        participantQuery = participantQuery.eq("is_active", true);
      } else if (currentTourStatus === "older") {
        // Show participants from last year OR active users (new users editing their profile)
        participantQuery = participantQuery.or(
          "was_active_last_year.eq.true,is_active.eq.true"
        );
      }
    }

    const { data, error: participantError } = (await participantQuery.single()) as {
      data: ParticipantDetails | null;
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

    if (!data || !data.user_info) {
      return NextResponse.json(
        { error: "Participant or user info not found" },
        { status: 404 }
      );
    }

    const userData = data.user_info;
    const planId = userData.plan_id;

    if (!data.user_id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 404 });
    }

    // Fetch additional related data
    const [imageData, mapInfo, visitingHoursData, events] = await Promise.all([
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
    ]);

    const transformedVisitingHours: VisitingHours = {
      hours:
        visitingHoursData.data?.reduce((acc, day) => {
          acc[day.day_id] = day.hours;
          return acc;
        }, {} as { [key: string]: OpenCloseTime[] }) || {},
    };

    let planData = null;
    if (planId) {
      const { data: planResult, error: planError } = await supabase
        .from("plans")
        .select("plan_label")
        .eq("plan_id", planId)
        .single();

      if (planError && planError.code !== "PGRST116") {
        throw planError;
      }

      planData = planResult;
    }

    const fullParticipantData = {
      ...data,
      is_sticky: isSticky, // Override the is_sticky field with our computed value
      user_info: {
        ...userData,
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
