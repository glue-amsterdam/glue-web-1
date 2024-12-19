import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("map_info").select(`
        *,
        user_info:user_id (
          user_name,
          visible_emails,
          participant_details (
            slug
          )
        )
      `);

    if (error) throw error;

    // Transform the data to include the slug directly in the main object
    const transformedData = data.map((item) => ({
      id: item.id,
      formatted_address: item.formatted_address,
      latitude: item.latitude,
      longitude: item.longitude,
      slug: item.user_info.participant_details[0]?.slug,
      user_info: {
        user_name: item.user_info.user_name,
        visible_emails: item.user_info.visible_emails,
      },
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching map information:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
