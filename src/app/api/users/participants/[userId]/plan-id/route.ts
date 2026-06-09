import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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

    const { data: participantDetails, error: participantError } =
      await supabase
        .from("participant_details")
        .select("plan_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (participantError) {
      console.error("Error fetching participant plan_id:", participantError);
      return NextResponse.json(
        { error: "Failed to fetch plan id" },
        { status: 500 }
      );
    }

    if (participantDetails?.plan_id) {
      return NextResponse.json({ plan_id: participantDetails.plan_id });
    }

    const { data: userInfo, error: userInfoError } = await supabase
      .from("user_info")
      .select("plan_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userInfoError) {
      console.error("Error fetching user_info plan_id:", userInfoError);
      return NextResponse.json(
        { error: "Failed to fetch plan id" },
        { status: 500 }
      );
    }

    if (!userInfo?.plan_id) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan_id: userInfo.plan_id });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
