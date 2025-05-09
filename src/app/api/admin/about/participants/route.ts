import { participantsSectionSchema } from "@/schemas/participantsAdminSchema";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: participantsData } = await supabase
      .from("about_participants")
      .select("title,description,is_visible")
      .single();

    if (!participantsData) {
      throw new Error("Failed to fetch participants about data");
    }

    return NextResponse.json(participantsData);
  } catch (error) {
    console.error("Error in GET /api/admin/about/participants", error);
    return NextResponse.json(
      { error: "An error occurred while fetching participants about data" },
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

    const validatedData = participantsSectionSchema.parse(body);

    const { data: participantsData, error: participantsError } = await supabase
      .from("about_participants")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
        is_visible: validatedData.is_visible,
      })
      .eq("id", "about-participants");

    if (participantsError) throw participantsError;

    return NextResponse.json(participantsData);
  } catch (error) {
    console.error("Error in PUT /api/about/participants", error);
    return NextResponse.json(
      { error: "An error occurred while updating participants about data" },
      { status: 500 }
    );
  }
}
