import type { SupabaseClient } from "@supabase/supabase-js";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";

export type OrganizerProfile = {
  user_id: string;
  user_name: string;
  participant_details: {
    slug: string | null;
    special_program: boolean;
    display_number: string | null;
  } | null;
};

export const loadOrganizerProfiles = async (
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, OrganizerProfile>> => {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const profileMap = new Map<string, OrganizerProfile>();

  if (uniqueIds.length === 0) {
    return profileMap;
  }

  const [participantsResult, visitorsResult, legacyUsersResult] =
    await Promise.all([
      supabase
        .from("participant_details")
        .select(
          "user_id, display_name, slug, special_program, display_number"
        )
        .in("user_id", uniqueIds),
      supabase
        .from("visitor_data")
        .select("auth_user_id, display_name, full_name")
        .in("auth_user_id", uniqueIds),
      supabase
        .from("user_info")
        .select("user_id, user_name")
        .in("user_id", uniqueIds),
    ]);

  const participantByUserId = new Map(
    (participantsResult.data ?? []).map((row) => [row.user_id, row])
  );
  const visitorByUserId = new Map(
    (visitorsResult.data ?? []).map((row) => [row.auth_user_id, row])
  );
  const legacyUserByUserId = new Map(
    (legacyUsersResult.data ?? []).map((row) => [row.user_id, row])
  );

  for (const userId of uniqueIds) {
    const participant = participantByUserId.get(userId);
    const visitor = visitorByUserId.get(userId);
    const legacyUser = legacyUserByUserId.get(userId);

    const user_name = getParticipantDisplayName({
      display_name:
        participant?.display_name ??
        visitor?.display_name ??
        visitor?.full_name,
      user_name: legacyUser?.user_name,
    });

    profileMap.set(userId, {
      user_id: userId,
      user_name,
      participant_details: participant
        ? {
            slug: participant.slug ?? null,
            special_program: participant.special_program ?? false,
            display_number: participant.display_number ?? null,
          }
        : null,
    });
  }

  return profileMap;
};

export const collectOrganizerUserIds = (
  events: Array<{
    organizer_id?: string | null;
    co_organizers?: string[] | null;
  }>
): string[] => {
  const ids = new Set<string>();

  for (const event of events) {
    if (event.organizer_id) {
      ids.add(event.organizer_id);
    }
    for (const coOrganizerId of event.co_organizers ?? []) {
      if (coOrganizerId) {
        ids.add(coOrganizerId);
      }
    }
  }

  return Array.from(ids);
};
