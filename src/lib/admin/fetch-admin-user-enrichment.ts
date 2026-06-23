import type { SupabaseClient } from "@supabase/supabase-js";

export type ParticipantDetailRow = {
  user_id: string;
  slug: string;
  status: string;
  is_active: boolean;
  special_program: boolean;
  reactivation_requested: boolean;
  reactivation_status: string | null;
  display_name: string | null;
};

export type VisitorDataRow = {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
};

export type AdminUserEnrichment = {
  participantByUserId: Map<string, ParticipantDetailRow>;
  visitorByUserId: Map<string, VisitorDataRow>;
  modByUserId: Map<string, boolean>;
  stickyParticipantIds: Set<string>;
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const IN_CHUNK_SIZE = 200;

export const fetchAdminUserEnrichment = async (
  admin: SupabaseClient,
  authUserIds: string[]
): Promise<AdminUserEnrichment> => {
  const participantByUserId = new Map<string, ParticipantDetailRow>();
  const visitorByUserId = new Map<string, VisitorDataRow>();
  const modByUserId = new Map<string, boolean>();
  const stickyParticipantIds = new Set<string>();

  if (authUserIds.length === 0) {
    return {
      participantByUserId,
      visitorByUserId,
      modByUserId,
      stickyParticipantIds,
    };
  }

  const idChunks = chunk(authUserIds, IN_CHUNK_SIZE);

  for (const ids of idChunks) {
    const [participantsResult, visitorsResult, permissionsResult, stickyResult] =
      await Promise.all([
        admin
          .from("participant_details")
          .select(
            [
              "user_id",
              "slug",
              "status",
              "is_active",
              "special_program",
              "reactivation_requested",
              "reactivation_status",
              "display_name",
            ].join(", ")
          )
          .in("user_id", ids),
        admin
          .from("visitor_data")
          .select(
            "id, auth_user_id, email, first_name, last_name, full_name, display_name"
          )
          .in("auth_user_id", ids),
        admin
          .from("user_permissions")
          .select("user_id, is_mod")
          .in("user_id", ids),
        admin
          .from("sticky_group_participants")
          .select("participant_user_id")
          .in("participant_user_id", ids),
      ]);

    if (participantsResult.error) {
      throw new Error(
        `Failed to fetch participant details: ${participantsResult.error.message}`
      );
    }
    if (visitorsResult.error) {
      throw new Error(
        `Failed to fetch visitor data: ${visitorsResult.error.message}`
      );
    }
    if (permissionsResult.error) {
      throw new Error(
        `Failed to fetch user permissions: ${permissionsResult.error.message}`
      );
    }

    for (const row of (participantsResult.data ?? []) as unknown as ParticipantDetailRow[]) {
      participantByUserId.set(row.user_id, row);
    }
    for (const row of (visitorsResult.data ?? []) as unknown as VisitorDataRow[]) {
      if (row.auth_user_id) {
        visitorByUserId.set(row.auth_user_id, row);
      }
    }
    for (const row of permissionsResult.data ?? []) {
      modByUserId.set(row.user_id, row.is_mod === true);
    }
    for (const row of stickyResult.data ?? []) {
      stickyParticipantIds.add(row.participant_user_id);
    }
  }

  return {
    participantByUserId,
    visitorByUserId,
    modByUserId,
    stickyParticipantIds,
  };
};
