import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: users_info, error: users_error } = await supabase
      .from("user_info")
      .select("*")
      .single();

    if (users_error) {
      throw new Error(`Failed to fetch userData: ${users_error?.message}`);
    }

    return NextResponse.json(users_info);
  } catch (error) {
    console.error("Error in GET /api /users:", error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "Failed to fetch users data",
        },
        {
          status: 500,
        }
      );
    }
  }
}
