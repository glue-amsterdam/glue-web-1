import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildHomeStickyMemberDisplays,
  buildStickyGroupMemberApiRows,
} from "@/lib/admin/sticky-group-members";
import type { HomeStickyGroupData } from "./types";

export const EMPTY_STICKY_GROUP: HomeStickyGroupData = {
  title: "",
  description: "",
  is_visible: false,
  year: null,
  group_photo_url: null,
  participants: [],
};

type StickyGroupParticipantRow = {
  participant_user_id: string | null;
  display_name_only: string | null;
  is_curated: boolean;
};

export const fetchLatestStickyGroup = async (
  supabase: SupabaseClient
): Promise<HomeStickyGroupData> => {
  const { data: section, error: headerError } = await supabase
    .from("about_curated")
    .select("title, description, is_visible")
    .single();

  if (headerError || !section) {
    return EMPTY_STICKY_GROUP;
  }

  if (!section.is_visible) {
    return {
      ...EMPTY_STICKY_GROUP,
      is_visible: false,
    };
  }

  const { data: latestYearRow, error: yearError } = await supabase
    .from("sticky_groups")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearError || latestYearRow?.year == null) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: null,
      group_photo_url: null,
      participants: [],
    };
  }

  const { data: group, error: groupError } = await supabase
    .from("sticky_groups")
    .select("id, year, group_photo_url")
    .eq("year", latestYearRow.year)
    .single();

  if (groupError || !group) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: latestYearRow.year,
      group_photo_url: null,
      participants: [],
    };
  }

  const { data: groupParticipants, error: participantsError } = await supabase
    .from("sticky_group_participants")
    .select("participant_user_id, display_name_only, is_curated")
    .eq("sticky_group_id", group.id);

  if (participantsError || !groupParticipants?.length) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: group.year,
      group_photo_url: group.group_photo_url ?? null,
      participants: [],
    };
  }

  const memberRows = await buildStickyGroupMemberApiRows(
    supabase,
    groupParticipants as StickyGroupParticipantRow[]
  );

  return {
    title: section.title ?? "",
    description: section.description ?? "",
    is_visible: section.is_visible,
    year: group.year,
    group_photo_url: group.group_photo_url ?? null,
    participants: buildHomeStickyMemberDisplays(memberRows),
  };
};
