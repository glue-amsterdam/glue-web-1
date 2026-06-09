import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateSiteThemeCache } from "@/lib/main/revalidate-site-theme-cache";
import { mainColorsFormSchema } from "@/schemas/mainSchema";
import {
  dbRowToMainColorsForm,
  mainColorsFormToDbRow,
} from "@/lib/main/map-main-colors-row";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: mainColors, error } = await supabase
      .from("main_colors")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching main colors:", error);
      return NextResponse.json(
        { error: "Failed to fetch main colors" },
        { status: 500 }
      );
    }

    return NextResponse.json(dbRowToMainColorsForm(mainColors));
  } catch (error) {
    console.error("Error in GET /api/admin/main/colors:", error);
    return NextResponse.json(
      { error: "Failed to fetch main colors" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const validated = mainColorsFormSchema.parse(body);
    const dbRow = mainColorsFormToDbRow(validated);

    const { data, error } = await supabase
      .from("main_colors")
      .update(dbRow)
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      console.error("Error updating main colors:", error);
      return NextResponse.json(
        { error: "Failed to update main colors" },
        { status: 500 }
      );
    }

    revalidateSiteThemeCache();

    return NextResponse.json(dbRowToMainColorsForm(data));
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
