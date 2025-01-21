import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: userInfo } = await supabase
      .from("user_info")
      .select("is_mod")
      .eq("user_id", user?.id)
      .single();

    const isAdmin = userInfo?.is_mod || false;

    // Fetch plans based on user role
    let query = supabase.from("plans").select("*").order("plan_id");

    if (!isAdmin) {
      query = query.eq("is_participant_enabled", true);
    }

    const { data: plans, error } = await query;

    if (error) {
      console.error("Error fetching plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({ plans: plans });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
