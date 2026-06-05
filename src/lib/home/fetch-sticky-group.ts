import type { SupabaseClient } from "@supabase/supabase-js";
import type { HomeStickyGroupData, HomeStickyParticipant } from "./types";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";

export const EMPTY_STICKY_GROUP: HomeStickyGroupData = {
  title: "",
  description: "",
  is_visible: false,
  year: null,
  group_photo_url: null,
  participants: [],
};

type ParticipantDetailRow = {
  user_id: string;
  slug: string;
  display_name: string | null;
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
    .select("participant_user_id")
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

  const userIds = groupParticipants.map((p) => p.participant_user_id);

  const { data: details, error: detailsError } = await supabase
    .from("participant_details")
    .select("user_id, slug, display_name")
    .in("user_id", userIds);

  if (detailsError || !details?.length) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: group.year,
      group_photo_url: group.group_photo_url ?? null,
      participants: [],
    };
  }

  const { data: images, error: imagesError } = await supabase
    .from("participant_image")
    .select("user_id, image_url")
    .in("user_id", userIds);

  if (imagesError) {
    return {
      title: section.title ?? "",
      description: section.description ?? "",
      is_visible: section.is_visible,
      year: group.year,
      group_photo_url: group.group_photo_url ?? null,
      participants: [],
    };
  }

  const participants: HomeStickyParticipant[] = (
    details as ParticipantDetailRow[]
  ).map((detail) => {
    const name = getParticipantDisplayName(detail);
    const imageRow = images?.find((img) => img.user_id === detail.user_id);

    return {
      userId: detail.user_id,
      slug: detail.slug,
      userName: name,
      image: {
        image_url: imageRow?.image_url ?? "/placeholder.jpg",
        alt: `${name} profile image - participant from GLUE design routes`,
      },
    };
  });

  return {
    title: section.title ?? "",
    description: section.description ?? "",
    is_visible: section.is_visible,
    year: group.year,
    group_photo_url: group.group_photo_url ?? null,
    participants,
  };
};
