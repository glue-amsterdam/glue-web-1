import type { SupabaseClient } from "@supabase/supabase-js";
import { chunkArray } from "@/lib/admin/chunk-array";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import type { StickyGroupMemberInput } from "@/types/sticky-member";

type StickyGroupParticipantRow = {
  id?: string;
  participant_user_id: string | null;
  is_curated: boolean;
};

export type StickyGroupMemberApiRow = {
  user_id: string;
  name: string;
  slug: string;
  image_url: string;
  is_curated: boolean;
};

export const membersToInsertRows = (
  stickyGroupId: string,
  members: StickyGroupMemberInput[]
) =>
  members.map((member) => ({
    sticky_group_id: stickyGroupId,
    participant_user_id: member.user_id,
    display_name_only: null,
    is_curated: member.is_curated ?? true,
  }));

export const validateStickyGroupMembers = async (
  supabase: SupabaseClient,
  members: StickyGroupMemberInput[] | undefined
): Promise<
  | { valid: true }
  | {
      valid: false;
      invalidUserIds: string[];
    }
> => {
  if (!members?.length) {
    return { valid: true };
  }

  const userIds = [...new Set(members.map((member) => member.user_id))];
  const validIds = new Set<string>();

  for (const chunk of chunkArray(userIds, 200)) {
    const { data, error } = await supabase
      .from("participant_details")
      .select("user_id")
      .in("user_id", chunk);

    if (error) throw error;

    for (const row of data ?? []) {
      validIds.add(row.user_id);
    }

    const remaining = chunk.filter((userId) => !validIds.has(userId));
    if (remaining.length === 0) continue;

    const { data: visitors, error: visitorError } = await supabase
      .from("visitor_data")
      .select("auth_user_id")
      .in("auth_user_id", remaining);

    if (visitorError) throw visitorError;

    for (const row of visitors ?? []) {
      if (row.auth_user_id) {
        validIds.add(row.auth_user_id);
      }
    }
  }

  const invalidUserIds = userIds.filter((userId) => !validIds.has(userId));

  if (invalidUserIds.length > 0) {
    for (const userId of invalidUserIds) {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (!error && data.user) {
        validIds.add(userId);
      }
    }
  }

  const remainingInvalidUserIds = userIds.filter((userId) => !validIds.has(userId));

  if (remainingInvalidUserIds.length > 0) {
    return {
      valid: false,
      invalidUserIds: remainingInvalidUserIds,
    };
  }

  return { valid: true };
};

export const buildStickyGroupMemberApiRows = async (
  supabase: SupabaseClient,
  rows: StickyGroupParticipantRow[]
): Promise<StickyGroupMemberApiRow[]> => {
  const userIds = rows
    .map((row) => row.participant_user_id)
    .filter((userId): userId is string => Boolean(userId));

  const participantByUserId = new Map<
    string,
    { slug: string; name: string }
  >();
  const visitorNameByUserId = new Map<string, string>();
  const imageByUserId = new Map<string, string>();

  if (userIds.length > 0) {
    for (const chunk of chunkArray(userIds, 200)) {
      const [detailsResult, imagesResult, visitorsResult] = await Promise.all([
        supabase
          .from("participant_details")
          .select("user_id, slug, display_name")
          .in("user_id", chunk),
        supabase
          .from("participant_image")
          .select("user_id, image_url")
          .in("user_id", chunk),
        supabase
          .from("visitor_data")
          .select(
            "auth_user_id, display_name, first_name, last_name, full_name"
          )
          .in("auth_user_id", chunk),
      ]);

      if (detailsResult.error) throw detailsResult.error;
      if (imagesResult.error) throw imagesResult.error;
      if (visitorsResult.error) throw visitorsResult.error;

      for (const detail of detailsResult.data ?? []) {
        participantByUserId.set(detail.user_id, {
          slug: detail.slug,
          name: getParticipantDisplayName(detail),
        });
      }

      for (const image of imagesResult.data ?? []) {
        imageByUserId.set(image.user_id, image.image_url);
      }

      for (const visitor of visitorsResult.data ?? []) {
        if (!visitor.auth_user_id) continue;
        visitorNameByUserId.set(
          visitor.auth_user_id,
          getVisitorDisplayName(visitor)
        );
      }
    }
  }

  return rows
    .filter((row) => Boolean(row.participant_user_id))
    .map((row) => {
      const userId = row.participant_user_id ?? "";
      const participant = participantByUserId.get(userId);
      const visitorName = visitorNameByUserId.get(userId);
      const name = participant?.name || visitorName || "Unknown member";

      return {
        user_id: userId,
        name,
        slug: participant?.slug ?? "",
        image_url: imageByUserId.get(userId) ?? "/placeholder.jpg",
        is_curated: row.is_curated,
      };
    });
};

export type HomeStickyMemberDisplay = {
  userId: string;
  slug: string | null;
  userName: string;
  image: { image_url: string; alt: string };
};

export const buildHomeStickyMemberDisplays = (
  apiRows: StickyGroupMemberApiRow[]
): HomeStickyMemberDisplay[] =>
  apiRows.map((row) => ({
    userId: row.user_id,
    slug: row.slug || null,
    userName: row.name,
    image: {
      image_url: row.image_url,
      alt: `${row.name} profile image - member from GLUE design routes`,
    },
  }));
