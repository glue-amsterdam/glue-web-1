import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("map_info").select(`
            *,
            user_info:user_id (
              user_name,
              visible_emails
            )
          `);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching map information:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
