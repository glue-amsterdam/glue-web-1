import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: users_info, error: users_error } = await supabase
      .from("user_info")
      .select("id, user_id, user_name, visible_emails, plan_type")
      .order("user_name", { ascending: true });

    if (users_error) {
      throw new Error(`Failed to fetch users list: ${users_error.message}`);
    }

    return NextResponse.json(users_info);
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
