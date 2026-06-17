import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildHomeStickyMemberDisplays,
  buildStickyGroupMemberApiRows,
} from "@/lib/admin/sticky-group-members";
import { EMPTY_STICKY_GROUP } from "./fetch-sticky-group";
import type { HomeStickyGroupData } from "./types";

type StickyGroupParticipantRow = {
  participant_user_id: string | null;
  is_curated: boolean;
};

export const fetchStickyGroupForYear = async (
  supabase: SupabaseClient,
  year: number
): Promise<HomeStickyGroupData> => {
  const { data: group, error: groupError } = await supabase
    .from("sticky_groups")
    .select("id, year, group_photo_url, title, description, additional_members_text")
    .eq("year", year)
    .maybeSingle();

  if (groupError || !group) {
    return {
      ...EMPTY_STICKY_GROUP,
      year,
    };
  }

  const { data: groupParticipants, error: participantsError } = await supabase
    .from("sticky_group_participants")
    .select("participant_user_id, is_curated")
    .eq("sticky_group_id", group.id)
    .not("participant_user_id", "is", null);

  if (participantsError) {
    return {
      title: group.title ?? "",
      description: group.description ?? "",
      year: group.year,
      group_photo_url: group.group_photo_url ?? null,
      additional_members_text: group.additional_members_text ?? "",
      participants: [],
    };
  }

  const memberRows = await buildStickyGroupMemberApiRows(
    supabase,
    (groupParticipants ?? []) as StickyGroupParticipantRow[]
  );

  return {
    title: group.title ?? "",
    description: group.description ?? "",
    year: group.year,
    group_photo_url: group.group_photo_url ?? null,
    additional_members_text: group.additional_members_text ?? "",
    participants: buildHomeStickyMemberDisplays(memberRows),
  };
};
