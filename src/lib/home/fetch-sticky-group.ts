import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildHomeStickyMemberDisplays,
  buildStickyGroupMemberApiRows,
} from "@/lib/admin/sticky-group-members";
import type { HomeStickyGroupData } from "./types";

export const EMPTY_STICKY_GROUP: HomeStickyGroupData = {
  title: "",
  description: "",
  year: null,
  group_photo_url: null,
  additional_members_text: "",
  participants: [],
};

type StickyGroupParticipantRow = {
  participant_user_id: string | null;
  is_curated: boolean;
};

export const hasStickyContent = (
  participants: HomeStickyGroupData["participants"],
  additionalMembersText: string
) => participants.length > 0 || additionalMembersText.trim().length > 0;

export const fetchLatestStickyGroup = async (
  supabase: SupabaseClient
): Promise<HomeStickyGroupData> => {
  const { data: latestYearRow, error: yearError } = await supabase
    .from("sticky_groups")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearError || latestYearRow?.year == null) {
    return EMPTY_STICKY_GROUP;
  }

  const { data: group, error: groupError } = await supabase
    .from("sticky_groups")
    .select("id, year, group_photo_url, title, description, additional_members_text")
    .eq("year", latestYearRow.year)
    .single();

  if (groupError || !group) {
    return EMPTY_STICKY_GROUP;
  }

  const { data: groupParticipants, error: participantsError } = await supabase
    .from("sticky_group_participants")
    .select("participant_user_id, is_curated")
    .eq("sticky_group_id", group.id)
    .not("participant_user_id", "is", null);

  if (participantsError) {
    return EMPTY_STICKY_GROUP;
  }

  const memberRows = await buildStickyGroupMemberApiRows(
    supabase,
    (groupParticipants ?? []) as StickyGroupParticipantRow[]
  );

  const participants = buildHomeStickyMemberDisplays(memberRows);
  const additionalMembersText = group.additional_members_text ?? "";

  if (!hasStickyContent(participants, additionalMembersText)) {
    return EMPTY_STICKY_GROUP;
  }

  return {
    title: group.title ?? "",
    description: group.description ?? "",
    year: group.year,
    group_photo_url: group.group_photo_url ?? null,
    additional_members_text: additionalMembersText,
    participants,
  };
};
