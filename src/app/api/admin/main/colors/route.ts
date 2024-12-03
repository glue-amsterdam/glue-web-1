import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mainColorsSchema } from "@/schemas/mainSchema";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: mainColors, error } = await supabase
      .from("main_colors")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching main colors:", error);
      return NextResponse.json(
        { error: "Failed to fetch main colors" },
        { status: 500 }
      );
    }

    const validatedLinks = mainColorsSchema.parse(mainColors);

    return NextResponse.json(validatedLinks);
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
    const updatedColors = await request.json();

    const { data, error } = await supabase
      .from("main_colors")
      .update(updatedColors)
      .eq("id", 1)
      .select();

    if (error) {
      console.error("Error updating main colors:", error);
      return NextResponse.json(
        { error: "Failed to update main colors" },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
