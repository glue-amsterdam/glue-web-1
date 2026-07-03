import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateHomeStickyCache } from "@/lib/home";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import {
  buildStickyGroupMemberApiRows,
  membersToInsertRows,
  validateStickyGroupMembers,
} from "@/lib/admin/sticky-group-members";
import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import type { StickyGroupMemberInput } from "@/types/sticky-member";

type GroupParticipantRow = {
  participant_user_id: string | null;
  is_curated: boolean;
};

type StickyGroupUpdateBody = {
  group_photo_url?: string;
  title?: string;
  description?: string;
  additional_members_text?: string;
  members?: StickyGroupMemberInput[];
  participants?: StickyGroupMemberInput[];
};

const normalizeMembers = (
  members: StickyGroupMemberInput[] | undefined,
  legacyParticipants: StickyGroupMemberInput[] | undefined
): StickyGroupMemberInput[] => {
  if (members?.length) {
    return members;
  }

  return (legacyParticipants ?? []).filter((member) => Boolean(member.user_id));
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await params;
    const supabase = await createClient();

    const { data: group, error: groupError } = await supabase
      .from("sticky_groups")
      .select("*")
      .eq("year", year)
      .single();

    if (groupError || !group) throw groupError || new Error("Group not found");

    const { data: participants, error: partError } = await supabase
      .from("sticky_group_participants")
      .select("participant_user_id, is_curated")
      .eq("sticky_group_id", group.id)
      .not("participant_user_id", "is", null);

    if (partError) throw partError;

    const memberRows = await buildStickyGroupMemberApiRows(
      supabase,
      (participants ?? []) as GroupParticipantRow[]
    );

    const membersWithLegacyShape = memberRows.map((member) => ({
      user_id: member.user_id,
      is_curated: member.is_curated,
      slug: member.slug,
      name: member.name,
      image_url: member.image_url,
    }));

    return NextResponse.json({
      id: group.id,
      year: group.year,
      group_photo_url: toMediaUrl(group.group_photo_url),
      title: group.title ?? "",
      description: group.description ?? "",
      additional_members_text: group.additional_members_text ?? "",
      members: membersWithLegacyShape,
      participants: membersWithLegacyShape,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { year } = await params;
    const yearInt = parseInt(year, 10);
    const supabase = auth.supabase;

    const { data: group, error: groupError } = await supabase
      .from("sticky_groups")
      .select("id")
      .eq("year", yearInt)
      .single();

    if (groupError || !group) throw groupError || new Error("Group not found");

    const { error: delError } = await supabase
      .from("sticky_groups")
      .delete()
      .eq("id", group.id);

    if (delError) {
      console.error("Failed to delete sticky group:", delError);
      throw delError;
    }

    revalidateHomeStickyCache(Number(year));
    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { year } = await params;
    const yearInt = parseInt(year, 10);
    const body = (await req.json()) as StickyGroupUpdateBody;
    const {
      group_photo_url,
      title,
      description,
      additional_members_text,
      members,
      participants,
    } = body;
    const supabase = auth.supabase;

    const resolvedMembers = normalizeMembers(members, participants);

    const validation = await validateStickyGroupMembers(
      supabase,
      resolvedMembers
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "One or more members are invalid",
          invalidUserIds: validation.invalidUserIds,
        },
        { status: 400 }
      );
    }

    const { data: group, error: groupError } = await supabase
      .from("sticky_groups")
      .select("id")
      .eq("year", yearInt)
      .single();

    if (groupError || !group) throw groupError || new Error("Group not found");

    const { error: updateError } = await supabase
      .from("sticky_groups")
      .update({
        group_photo_url: toMediaKey(group_photo_url),
        title: title ?? "",
        description: description ?? "",
        additional_members_text: additional_members_text ?? "",
      })
      .eq("id", group.id);

    if (updateError) {
      console.error("Failed to update sticky group:", updateError);
      throw updateError;
    }

    const { error: delError } = await supabase
      .from("sticky_group_participants")
      .delete()
      .eq("sticky_group_id", group.id);

    if (delError) {
      console.error("Failed to delete sticky group members:", delError);
      throw delError;
    }

    const memberCount = resolvedMembers.length;

    if (memberCount > 0) {
      const insertData = membersToInsertRows(group.id, resolvedMembers);

      const { error: partError } = await supabase
        .from("sticky_group_participants")
        .insert(insertData);

      if (partError) {
        console.error("Failed to insert sticky group members:", partError);
        throw partError;
      }
    }

    const { data: updatedGroup, error: fetchError } = await supabase
      .from("sticky_groups")
      .select("id, year, group_photo_url, title, description, additional_members_text")
      .eq("id", group.id)
      .single();

    if (fetchError) throw fetchError;

    revalidateHomeStickyCache(Number(year));
    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({
      ...updatedGroup,
      group_photo_url: toMediaUrl(updatedGroup.group_photo_url),
      memberCount,
      participantCount: memberCount,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
