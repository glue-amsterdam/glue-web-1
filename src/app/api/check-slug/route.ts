import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("participant_details")
      .select("slug")
      .eq("slug", slug);

    if (error) {
      throw error;
    }

    // The slug is unique if no matching records were found
    const isUnique = data.length === 0;

    return NextResponse.json({ isUnique });
  } catch (error) {
    console.error("Error checking slug uniqueness:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
