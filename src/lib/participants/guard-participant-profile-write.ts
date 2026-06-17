import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const guardParticipantProfileWrite = async (
  targetUserId: string
): Promise<NextResponse | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isMod = await getIsPlatformMod(supabase, user.id);
  if (isMod) {
    return null;
  }

  if (user.id !== targetUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: participantDetails } = await supabase
    .from("participant_details")
    .select("is_active, status")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (participantDetails?.status === "pending") {
    return NextResponse.json(
      { error: "Pending participants cannot modify profile data" },
      { status: 403 }
    );
  }

  if (!participantDetails?.is_active) {
    return NextResponse.json(
      { error: "Inactive participants cannot modify profile data" },
      { status: 403 }
    );
  }

  return null;
};
