import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching event settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch event settings" },
        { status: 500 }
      );
    }

    // Return default if no data exists
    if (!data) {
      return NextResponse.json({ header_title: "Events" });
    }

    return NextResponse.json({ header_title: data.header_title || "Events" });
  } catch (error) {
    console.error("Error in GET /api/admin/events/header-title:", error);
    return NextResponse.json(
      { error: "Failed to fetch event settings" },
      { status: 500 }
    );
  }
}

async function updateHeaderTitle(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { header_title } = body;

    if (!header_title || typeof header_title !== "string") {
      return NextResponse.json(
        { error: "header_title is required and must be a string" },
        { status: 400 }
      );
    }

    // Get the first record's id (single-row table)
    const { data: selectData, error: selectError } = await supabase
      .from("event_settings")
      .select("id")
      .limit(1);

    if (selectError || !selectData || !selectData[0]) {
      // If no record exists, create one
      const { data: insertData, error: insertError } = await supabase
        .from("event_settings")
        .insert({
          id: "00000000-0000-0000-0000-000000000001",
          header_title,
          updated_at: new Date().toISOString(),
          updated_by: adminToken.value,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating event settings:", insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      // Revalidate the events page to show the updated title immediately
      revalidatePath("/events");

      return NextResponse.json({ header_title: insertData.header_title });
    }

    const id = selectData[0].id;
    const { data, error } = await supabase
      .from("event_settings")
      .update({
        header_title,
        updated_at: new Date().toISOString(),
        updated_by: adminToken.value,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate the events page to show the updated title immediately
    revalidatePath("/events");

    return NextResponse.json({ header_title: data.header_title });
  } catch (error) {
    console.error("Error in PUT /api/admin/events/header-title:", error);
    return NextResponse.json(
      { error: "Failed to update event settings" },
      { status: 500 }
    );
  }
}

export const PATCH = updateHeaderTitle;
export const PUT = updateHeaderTitle;
