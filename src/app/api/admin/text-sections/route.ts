import { fetchTextSectionsByGroup } from "@/lib/text-sections/fetch-text-sections-by-group";
import { isTextSectionAdminGroup } from "@/schemas/textSectionSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    if (!group || !isTextSectionAdminGroup(group)) {
      return NextResponse.json(
        { error: "Invalid or missing group parameter" },
        { status: 400 }
      );
    }

    const supabase = createPublicSupabaseClient();
    const sections = await fetchTextSectionsByGroup(supabase, group);

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error in GET /api/admin/text-sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch text sections" },
      { status: 500 }
    );
  }
}
