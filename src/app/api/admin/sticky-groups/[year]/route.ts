import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await params;
    const adminClient = await createClient();
    // Get group for year
    const { data: group, error: groupError } = await adminClient
      .from("sticky_groups")
      .select("*")
      .eq("year", year)
      .single();
    if (groupError || !group) throw groupError || new Error("Group not found");
    // Get participants for group
    const { data: participants, error: partError } = await adminClient
      .from("sticky_group_participants")
      .select("participant_user_id, is_curated")
      .eq("sticky_group_id", group.id);
    if (partError) throw partError;
    return NextResponse.json({
      id: group.id,
      year: group.year,
      group_photo_url: group.group_photo_url,
      participants: participants || [],
    });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { year: string } }
) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
  try {
    const year = parseInt(params.year, 10);
    const adminClient = await createClient();
    // Get group id
    const { data: group, error: groupError } = await adminClient
      .from("sticky_groups")
      .select("id")
      .eq("year", year)
      .single();
    if (groupError || !group) throw groupError || new Error("Group not found");
    // Delete group (cascade deletes participants)
    const { error: delError } = await adminClient
      .from("sticky_groups")
      .delete()
      .eq("id", group.id);
    if (delError) throw delError;
    return NextResponse.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { year: string } }
) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
  try {
    const year = parseInt(params.year, 10);
    const body = await req.json();
    const { group_photo_url, participants } = body;
    const adminClient = await createClient();
    // Get group id
    const { data: group, error: groupError } = await adminClient
      .from("sticky_groups")
      .select("id")
      .eq("year", year)
      .single();
    if (groupError || !group) throw groupError || new Error("Group not found");
    // Update group photo
    const { error: updateError } = await adminClient
      .from("sticky_groups")
      .update({ group_photo_url })
      .eq("id", group.id);
    if (updateError) throw updateError;
    // Remove all old participants
    const { error: delError } = await adminClient
      .from("sticky_group_participants")
      .delete()
      .eq("sticky_group_id", group.id);
    if (delError) throw delError;
    // Insert new participants
    if (participants && participants.length > 0) {
      const insertData = participants.map(
        (p: { user_id: string; is_curated: boolean }) => ({
          sticky_group_id: group.id,
          participant_user_id: p.user_id,
          is_curated: p.is_curated,
        })
      );
      const { error: partError } = await adminClient
        .from("sticky_group_participants")
        .insert(insertData);
      if (partError) throw partError;
    }
    // Return updated group
    const { data: updatedGroup, error: fetchError } = await adminClient
      .from("sticky_groups")
      .select("id, year, group_photo_url")
      .eq("id", group.id)
      .single();
    if (fetchError) throw fetchError;
    return NextResponse.json(updatedGroup);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
