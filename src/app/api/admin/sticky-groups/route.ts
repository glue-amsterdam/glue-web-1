import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { mergeMembersWithResolvedNames } from "@/lib/admin/resolve-sticky-member-by-name";
import { revalidateHomeStickyCache } from "@/lib/home";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import {
  membersToInsertRows,
  validateStickyGroupMembers,
} from "@/lib/admin/sticky-group-members";
import type { StickyGroupMemberInput } from "@/types/sticky-member";

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

export async function POST(req: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const {
      year,
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
      .insert({ year, group_photo_url })
      .select("id, year")
      .single();

    if (groupError || !group) {
      console.error("Failed to create sticky group:", groupError);
      throw groupError || new Error("Failed to create group");
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

    revalidateHomeStickyCache();
    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({
      id: group.id,
      year: group.year,
      memberCount,
      participantCount: memberCount,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
