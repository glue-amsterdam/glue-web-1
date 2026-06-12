import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateHomeStickyCache } from "@/lib/home";
import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import {
  membersToInsertRows,
  validateStickyGroupMembers,
} from "@/lib/admin/sticky-group-members";
import type { StickyGroupMemberInput } from "@/types/sticky-member";

type StickyGroupBody = {
  year: number;
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

export async function POST(req: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as StickyGroupBody;
    const {
      year,
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
      .insert({
        year,
        group_photo_url,
        title: title ?? "",
        description: description ?? "",
        additional_members_text: additional_members_text ?? "",
      })
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
