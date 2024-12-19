import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const supabase = await createClient();

    const { data: user_info, error: user_error } = await supabase
      .from("user_info")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (user_error) {
      throw new Error(`Failed to fetch user data: ${user_error.message}`);
    }

    if (!user_info) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch participant details
    const { data: participant_details } = await supabase
      .from("participant_details")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Fetch invoice data
    const { data: invoice_data } = await supabase
      .from("invoice_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Fetch visiting hours
    const { data: visiting_hours } = await supabase
      .from("visiting_hours")
      .select("*")
      .eq("user_id", userId)
      .single();

    const combinedUserInfo = {
      ...user_info,
      participantDetails: participant_details || undefined,
      invoiceData: invoice_data || undefined,
      visitingHours: visiting_hours || undefined,
    };

    return NextResponse.json(combinedUserInfo);
  } catch (error) {
    console.error(`Error in GET /api/users/${userId}:`, error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
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
