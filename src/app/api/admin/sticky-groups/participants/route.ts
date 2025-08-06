import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
  try {
    const adminClient = await createClient();
    const { data, error } = await adminClient.from("participant_details")
      .select(`
        user_id,
        slug,
        user_info (
          user_name
        )
      `);
    if (error) throw error;
    // Map to { user_id, slug, name }
    const participants = (data || []).map(
      (p: {
        user_id: string;
        slug: string;
        user_info: { user_name: string } | { user_name: string }[] | null;
      }) => {
        let name = "";
        if (Array.isArray(p.user_info)) {
          name = p.user_info[0]?.user_name || "";
        } else if (p.user_info) {
          name = p.user_info.user_name;
        }
        return {
          user_id: p.user_id,
          slug: p.slug,
          name,
        };
      }
    );
    return NextResponse.json(participants);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
