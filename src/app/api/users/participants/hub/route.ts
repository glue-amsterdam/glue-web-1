import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // For hub creation/editing, always show only currently active participants
    // regardless of tour_status - hubs are for active tour management
    const { data: acceptedParticipants, error: participantError } =
      await supabase
        .from("participant_details")
        .select("user_id")
        .eq("status", "accepted")
        .eq("is_active", true);

    if (participantError) {
      throw new Error(
        `Failed to fetch accepted participants: ${participantError.message}`
      );
    }

    const acceptedUserIds = acceptedParticipants.map((p) => p.user_id);

    // Then, fetch user info for accepted participants
    const { data: users_info, error: users_error } = await supabase
      .from("user_info")
      .select("id, user_id, user_name, visible_emails, plan_type")
      .in("user_id", acceptedUserIds)
      .order("user_name", { ascending: true });

    if (users_error) {
      throw new Error(`Failed to fetch users list: ${users_error.message}`);
    }

    return NextResponse.json(users_info);
  } catch (error) {
    console.error("Error in GET /api/users/list:", error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch users list" },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}
