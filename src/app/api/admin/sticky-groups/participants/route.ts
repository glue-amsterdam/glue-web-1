import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";

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
    const { data, error } = await adminClient
      .from("participant_details")
      .select("user_id, slug, display_name");

    if (error) throw error;

    const participants = (data || []).map(
      (p: { user_id: string; slug: string; display_name: string | null }) => ({
        user_id: p.user_id,
        slug: p.slug,
        name: getParticipantDisplayName(p),
      })
    );

    return NextResponse.json(participants);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
