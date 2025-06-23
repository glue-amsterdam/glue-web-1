import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id, plan_id, plan_type, notes } = body;

  if (!user_id || !plan_id || !plan_type) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_info")
    .update({
      upgrade_requested: true,
      upgrade_requested_at: new Date().toISOString(),
      upgrade_requested_plan_id: plan_id,
      upgrade_requested_plan_type: plan_type,
      upgrade_request_notes: notes ?? null,
    })
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
