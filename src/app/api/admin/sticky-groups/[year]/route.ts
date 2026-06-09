import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateHomeStickyCache } from "@/lib/home";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { mergeMembersWithResolvedNames } from "@/lib/admin/resolve-sticky-member-by-name";
import {
  buildStickyGroupMemberApiRows,
  membersToInsertRows,
  validateStickyGroupMembers,
} from "@/lib/admin/sticky-group-members";
import type { StickyGroupMemberInput } from "@/types/sticky-member";

type GroupParticipantRow = {
  participant_user_id: string | null;
  display_name_only: string | null;
  is_curated: boolean;
};

const normalizeMembers = (
  members: StickyGroupMemberInput[] | undefined,
  legacyParticipants:
    | Array<{ user_id?: string; display_name_only?: string; is_curated?: boolean }>
    | undefined
): StickyGroupMemberInput[] => {
  if (members?.length) {
    return members;
  }

  return (legacyParticipants ?? []).map((member) => ({
    user_id: member.user_id,
    display_name_only: member.display_name_only,
    is_curated: member.is_curated,
  }));
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
      .select("participant_user_id, display_name_only, is_curated")
      .eq("sticky_group_id", group.id);

    if (partError) throw partError;

    const memberRows = await buildStickyGroupMemberApiRows(
      supabase,
      (participants ?? []) as GroupParticipantRow[]
    );

    const membersWithLegacyShape = memberRows.map((member) => ({
      kind: member.kind,
      user_id: member.user_id,
      display_name_only: member.display_name_only,
      is_curated: member.is_curated,
      slug: member.slug,
      name: member.name,
      image_url: member.image_url,
    }));

    return NextResponse.json({
      id: group.id,
      year: group.year,
      group_photo_url: group.group_photo_url,
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
    const body = await req.json();
    const {
      group_photo_url,
      members,
      participants,
      participant_names,
      member_names,
    } = body;
    const supabase = auth.supabase;

    const baseMembers = normalizeMembers(members, participants);

    const merged = await mergeMembersWithResolvedNames(
      supabase,
      baseMembers,
      member_names ?? participant_names
    );

    if (!merged.ok) {
      return NextResponse.json(
        {
          error: "Could not resolve member names",
          ambiguous: merged.ambiguous,
          suggestions: merged.suggestions,
        },
        { status: 400 }
      );
    }

    const resolvedMembers = merged.members;

    const validation = await validateStickyGroupMembers(
      supabase,
      resolvedMembers
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "One or more members are invalid",
          invalidUserIds: validation.invalidUserIds,
          invalidDisplayNames: validation.invalidDisplayNames,
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
      .update({ group_photo_url })
      .eq("id", group.id);

    if (updateError) {
      console.error("Failed to update sticky group photo:", updateError);
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
      .select("id, year, group_photo_url")
      .eq("id", group.id)
      .single();

    if (fetchError) throw fetchError;

    revalidateHomeStickyCache(Number(year));
    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({
      ...updatedGroup,
      memberCount,
      participantCount: memberCount,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
