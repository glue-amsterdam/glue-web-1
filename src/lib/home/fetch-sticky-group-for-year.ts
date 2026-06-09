import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildHomeStickyMemberDisplays,
  buildStickyGroupMemberApiRows,
} from "@/lib/admin/sticky-group-members";
import { EMPTY_STICKY_GROUP } from "./fetch-sticky-group";
import type { HomeStickyGroupData } from "./types";

type StickyGroupParticipantRow = {
  participant_user_id: string | null;
  display_name_only: string | null;
  is_curated: boolean;
};

export const fetchStickyGroupForYear = async (
  supabase: SupabaseClient,
  year: number
): Promise<HomeStickyGroupData> => {
  const { data: section, error: headerError } = await supabase
    .from("about_curated")
    .select("title, description, is_visible")
    .single();

  if (headerError || !section) {
    return EMPTY_STICKY_GROUP;
  }

  const { data: group, error: groupError } = await supabase
    .from("sticky_groups")
    .select("id, year, group_photo_url")
    .eq("year", year)
    .maybeSingle();

  if (groupError || !group) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year,
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
