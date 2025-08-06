import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Define types for user info and participant details
interface UserInfo {
  id: string;
  user_id: string;
  user_name: string;
  visible_emails: string[] | null;
  plan_type: string;
  is_mod: boolean;
  created_at: string;
  upgrade_requested: boolean;
  upgrade_requested_plan_id: string | null;
  upgrade_requested_plan_type: string | null;
  upgrade_request_notes: string | null;
  upgrade_requested_at: string | null;
  phone_numbers: string[] | null;
  social_media: string[] | null;
  visible_websites: string[] | null;
}

interface ParticipantDetail {
  user_id: string;
  slug: string;
  status: string;
  is_active: boolean;
  special_program: boolean;
  reactivation_requested: boolean;
  reactivation_status: string | null;
}

// Type guards
function isUserInfo(obj: unknown): obj is UserInfo {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.user_id === "string" &&
    typeof o.user_name === "string" &&
    "plan_type" in o
  );
}

function isParticipantDetail(obj: unknown): obj is ParticipantDetail {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.user_id === "string" && typeof o.slug === "string" && "status" in o
  );
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get extended user info
    const { data: users_info, error: users_error } = await supabase
      .from("user_info")
      .select(
        [
          "id",
          "user_id",
          "user_name",
          "visible_emails",
          "plan_type",
          "is_mod",
          "created_at",
          "upgrade_requested",
          "upgrade_requested_plan_id",
          "upgrade_requested_plan_type",
          "upgrade_request_notes",
          "upgrade_requested_at",
          "phone_numbers",
          "social_media",
          "visible_websites",
        ].join(", ")
      )
      .order("user_name", { ascending: true });

    if (users_error) {
      throw new Error(`Failed to fetch users list: ${users_error.message}`);
    }

    if (!Array.isArray(users_info)) {
      return NextResponse.json([]);
    }

    // Type assertion for users_info
    const typedUsersInfo: UserInfo[] = Array.isArray(users_info)
      ? (users_info.filter(isUserInfo) as unknown[] as UserInfo[])
      : [];

    // Get participant details for participants only
    const participantIds =
      typedUsersInfo
        .filter((user) => user.plan_type === "participant")
        .map((user) => user.user_id) || [];

    let participantDetails: ParticipantDetail[] = [];
    let stickyParticipantIds: string[] = [];

    if (participantIds.length > 0) {
      // Fetch participant details
      const { data: participant_data, error: participant_error } =
        await supabase
          .from("participant_details")
          .select(
            [
              "user_id",
              "slug",
              "status",
              "is_active",
              "special_program",
              "reactivation_requested",
              "reactivation_status",
            ].join(", ")
          )
          .in("user_id", participantIds);

      // Fetch sticky group participants to determine sticky status
      const { data: sticky_data, error: sticky_error } = await supabase
        .from("sticky_group_participants")
        .select("participant_user_id")
        .in("participant_user_id", participantIds);

      if (participant_error) {
        throw new Error(
          `Failed to fetch participant details: ${participant_error.message}`
        );
      }

      if (sticky_error) {
        console.error("Error fetching sticky participants:", sticky_error);
        // Don't throw error for sticky participants, just log it
      }

      participantDetails = Array.isArray(participant_data)
        ? (participant_data.filter(
            isParticipantDetail
          ) as unknown[] as ParticipantDetail[])
        : [];

      stickyParticipantIds = Array.isArray(sticky_data)
        ? sticky_data.map((sp) => sp.participant_user_id)
        : [];
    }

    // Combine user info with participant details
    const enrichedUsers = typedUsersInfo.map((user) => {
      if (user.plan_type === "participant") {
        const participantInfo = participantDetails.find(
          (p) => p.user_id === user.user_id
        );
        const isSticky = stickyParticipantIds.includes(user.user_id);
        return {
          ...user,
          participant_slug: participantInfo?.slug,
          participant_status: participantInfo?.status,
          participant_is_sticky: isSticky,
          participant_is_active: participantInfo?.is_active,
          participant_special_program: participantInfo?.special_program,
          participant_reactivation_requested:
            participantInfo?.reactivation_requested,
          participant_reactivation_status: participantInfo?.reactivation_status,
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
