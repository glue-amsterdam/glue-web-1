import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("terms_and_conditions")
      .select("content")
      .single();

    if (error) {
      // If table doesn't exist or no record found, return empty
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({ content: "" });
      }
      throw error;
    }

    return NextResponse.json({ content: data?.content || "" });
  } catch (error) {
    console.error("Error in GET /api/terms:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching terms and conditions" },
      { status: 500 }
    );
  }
}
