import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { glueInternationalSectionSchema } from "@/schemas/internationalSchema";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: internationalData, error } = await supabase
      .from("about_international")
      .select("title, subtitle, button_text, website, button_color")
      .eq("id", "about-international-section")
      .single();

    if (error) throw error;

    return NextResponse.json(internationalData);
  } catch (error) {
    console.error("Error in GET /api/admin/about/international", error);
    return NextResponse.json(
      { error: "An error occurred while fetching international content data" },
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

    const validatedData = glueInternationalSectionSchema.parse(body);

    const { data: updatedData, error } = await supabase
      .from("about_international")
      .update({
        title: validatedData.title,
        subtitle: validatedData.subtitle,
        button_text: validatedData.button_text,
        website: validatedData.website,
        button_color: validatedData.button_color,
      })
      .eq("id", "about-international-section")
      .select();

    if (error) throw error;

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Error in PUT /api/admin/about/international", error);
    return NextResponse.json(
      { error: "An error occurred while updating international content data" },
      { status: 500 }
    );
  }
}
