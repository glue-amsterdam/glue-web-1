import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    
    // Check if we need to fetch current active participants (before closing) or previous tour participants (after closing)
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "current"; // "current" or "previous"

    let participantQuery = supabase
      .from("participant_details")
      .select(
        `
        user_id,
        slug,
        status,
        is_active,
        was_active_last_year,
        user_info!participant_details_user_id_fkey (
          user_id,
          user_name
        )
      `
      )
      .eq("status", "accepted");

    if (mode === "current") {
      // Fetch CURRENT active participants (before closing tour)
      // These are the participants that will be snapshotted
      participantQuery = participantQuery.eq("is_active", true);
    } else {
      // Fetch PREVIOUS tour participants (after closing, was_active_last_year = true)
      participantQuery = participantQuery.eq("was_active_last_year", true);
    }
    
    participantQuery = participantQuery.order("user_id");
    
    const { data: participants, error } = await participantQuery;

    if (error) {
      console.error("Error fetching participants:", error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error in GET /api/admin/main/tour-participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const { participantIds } = await request.json();

    if (!Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "participantIds must be an array" },
        { status: 400 }
      );
    }

    // First, set all participants with was_active_last_year = true to is_active = false
    const { error: deactivateError } = await supabase
      .from("participant_details")
      .update({ is_active: false })
      .eq("was_active_last_year", true);

    if (deactivateError) {
      console.error("Error deactivating participants:", deactivateError);
      return NextResponse.json(
        { error: "Failed to update participant status" },
        { status: 500 }
      );
    }

    // Then, set the selected participants to is_active = true
    if (participantIds.length > 0) {
      const { error: activateError } = await supabase
        .from("participant_details")
        .update({ is_active: true })
        .in("user_id", participantIds)
        .eq("was_active_last_year", true);

      if (activateError) {
        console.error("Error activating selected participants:", activateError);
        return NextResponse.json(
          { error: "Failed to update selected participants" },
          { status: 500 }
        );
      }
    }

    // Get counts for response
    const { count: totalCount } = await supabase
      .from("participant_details")
      .select("*", { count: "exact", head: true })
      .eq("was_active_last_year", true);

    const { count: activeCount } = await supabase
      .from("participant_details")
      .select("*", { count: "exact", head: true })
      .eq("was_active_last_year", true)
      .eq("is_active", true);

    return NextResponse.json({
      message: "Participant carryover updated successfully",
      totalParticipants: totalCount || 0,
      activeParticipants: activeCount || 0,
      inactiveParticipants: (totalCount || 0) - (activeCount || 0),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
