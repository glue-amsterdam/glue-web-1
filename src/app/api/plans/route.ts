import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const all = req.nextUrl.searchParams.get("all");

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

    const applicationClosed = status?.application_closed ?? false;

    if (applicationClosed && all !== "true") {
      return NextResponse.json({
        plans: [],
        applicationClosed: true,
        closedMessage: status?.closed_message || "",
      });
    }

    let query = supabase.from("plans").select("*").order("order_by");

    if (all !== "true") {
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

    return NextResponse.json({
      plans,
      applicationClosed,
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
