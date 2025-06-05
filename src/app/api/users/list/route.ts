import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get basic user info
    const { data: users_info, error: users_error } = await supabase
      .from("user_info")
      .select(
        "id, user_id, user_name, visible_emails, plan_type, is_mod, created_at"
      )
      .order("user_name", { ascending: true });

    if (users_error) {
      throw new Error(`Failed to fetch users list: ${users_error.message}`);
    }

    // Get participant details for participants only
    const participantIds =
      users_info
        ?.filter((user) => user.plan_type === "participant")
        .map((user) => user.user_id) || [];

    interface ParticipantDetail {
      user_id: string;
      slug: string;
      status: string;
      is_sticky: boolean;
      is_active: boolean;
    }

    let participantDetails: ParticipantDetail[] = [];

    if (participantIds.length > 0) {
      const { data: participant_data } = await supabase
        .from("participant_details")
        .select("user_id, slug, status, is_sticky, is_active")
        .in("user_id", participantIds);

      participantDetails = participant_data || [];
    }

    // Combine user info with participant details
    const enrichedUsers = users_info?.map((user) => {
      if (user.plan_type === "participant") {
        const participantInfo = participantDetails.find(
          (p) => p.user_id === user.user_id
        );
        return {
          ...user,
          participant_slug: participantInfo?.slug,
          participant_status: participantInfo?.status,
          participant_is_sticky: participantInfo?.is_sticky,
          participant_is_active: participantInfo?.is_active,
        };
      }
      return user;
    });

    return NextResponse.json(enrichedUsers);
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
