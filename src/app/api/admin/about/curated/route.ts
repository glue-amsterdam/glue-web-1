import { curatedMembersSectionSchema } from "@/schemas/curatedSchema";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: curatedData } = await supabase
      .from("about_curated")
      .select("title,description, is_visible, text_color, background_color")
      .single();

    if (!curatedData) {
      throw new Error("Failed to fetch curated about data");
    }

    return NextResponse.json(curatedData);
  } catch (error) {
    console.error("Error in GET /api/admin/about/curated", error);
    return NextResponse.json(
      { error: "An error occurred while fetching curated about data" },
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

    const validatedData = curatedMembersSectionSchema.parse(body);

    const { data: curatedData, error: curatedError } = await supabase
      .from("about_curated")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
        is_visible: validatedData.is_visible,
        text_color: validatedData.text_color,
        background_color: validatedData.background_color,
      })
      .eq("id", "about-curated");

    if (curatedError) throw curatedError;

    return NextResponse.json(curatedData);
  } catch (error) {
    console.error("Error in PUT /api/admin/about/curated", error);
    return NextResponse.json(
      { error: "An error occurred while updating curated about data" },
      { status: 500 }
    );
  }
}
