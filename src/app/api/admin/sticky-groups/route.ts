import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
  try {
    const body = await req.json();
    const { year, group_photo_url, participants } = body;
    const adminClient = await createClient();
    // Create group
    const { data: group, error: groupError } = await adminClient
      .from("sticky_groups")
      .insert({ year, group_photo_url })
      .select("id")
      .single();
    if (groupError || !group)
      throw groupError || new Error("Failed to create group");
    // Insert participants
    if (participants && participants.length > 0) {
      const insertData = participants.map(
        (p: { user_id: string; is_curated: boolean }) => ({
          sticky_group_id: group.id,
          participant_user_id: p.user_id,
          is_curated: true,
        })
      );
      const { error: partError } = await adminClient
        .from("sticky_group_participants")
        .insert(insertData);
      if (partError) throw partError;
    }
    return NextResponse.json({ id: group.id });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
