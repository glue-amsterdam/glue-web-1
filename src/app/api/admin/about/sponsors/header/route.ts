import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sponsorsHeaderSchema } from "@/schemas/sponsorsSchema";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("about_sponsors_header")
      .select("*")
      .eq("id", "about-sponsors-header-section-56ca13952fcc")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/admin/sponsors/header", error);
    return NextResponse.json(
      { error: "An error occurred while fetching sponsors header data" },
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

    const validatedData = sponsorsHeaderSchema.parse(body);

    const { data, error } = await supabase
      .from("about_sponsors_header")
      .update({
        title: validatedData.title,
        description: validatedData.description,
        sponsors_types: validatedData.sponsors_types,
      })
      .eq("id", "about-sponsors-header-section-56ca13952fcc")
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/admin/sponsors/header", error);
    return NextResponse.json(
      { error: "An error occurred while updating sponsors header data" },
      { status: 500 }
    );
  }
}
