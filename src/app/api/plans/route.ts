import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const all = req.nextUrl.searchParams.get("all");

    // Check application status first
    const { data: status, error: statusError } = await supabase
      .from("plans_status")
      .select("application_closed, closed_message")
      .single();

    if (statusError) {
      console.error("Error fetching plans status:", statusError);
      return NextResponse.json(
        { error: "Failed to fetch plans status" },
        { status: 500 }
      );
    }

    let query = supabase.from("plans").select("*").order("order_by");

    // If applications are closed and not requesting all plans, only show free and member plans
    if (status?.application_closed && all !== "true") {
      query = query.in("plan_type", ["free", "member"]);
    } else if (all !== "true") {
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

    // Include application status in response
    return NextResponse.json({
      plans,
      applicationClosed: status?.application_closed || false,
      closedMessage: status?.closed_message || "",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
