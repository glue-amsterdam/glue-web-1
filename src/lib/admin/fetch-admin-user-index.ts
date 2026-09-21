import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ParticipantDetailRow,
  VisitorDataRow,
} from "@/lib/admin/fetch-admin-user-enrichment";

const PAGE_SIZE = 1000;

export type AdminUserIndexData = {
  participants: ParticipantDetailRow[];
  visitors: VisitorDataRow[];
  modUserIds: Set<string>;
  stickyParticipantIds: Set<string>;
};

const fetchAllRows = async <T>(
  fetchPage: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> => {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) {
      throw new Error(error.message);
    }
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
};

export const fetchAdminUserIndex = async (
  admin: SupabaseClient
): Promise<AdminUserIndexData> => {
  const [participants, visitors, permissions, sticky] = await Promise.all([
    fetchAllRows<ParticipantDetailRow>(async (from, to) => {
      const result = await admin
        .from("participant_details")
        .select(
          [
            "user_id",
            "slug",
            "status",
            "is_active",
            "category",
            "reactivation_requested",
            "reactivation_status",
            "display_name",
          ].join(", ")
        )
        .order("user_id", { ascending: true })
        .range(from, to);
      return {
        data: (result.data ?? null) as ParticipantDetailRow[] | null,
        error: result.error,
      };
    }),
    fetchAllRows<VisitorDataRow>(async (from, to) => {
      const result = await admin
        .from("visitor_data")
        .select(
          "id, auth_user_id, email, first_name, last_name, full_name, display_name, birth_date, area_id, created_at"
        )
        .order("id", { ascending: true })
        .range(from, to);
      return {
        data: (result.data ?? null) as VisitorDataRow[] | null,
        error: result.error,
      };
    }),
    fetchAllRows<{ user_id: string; is_mod: boolean }>(async (from, to) => {
      const result = await admin
        .from("user_permissions")
        .select("user_id, is_mod")
        .eq("is_mod", true)
        .order("user_id", { ascending: true })
        .range(from, to);
      return { data: result.data, error: result.error };
    }),
    fetchAllRows<{ participant_user_id: string }>(async (from, to) => {
      const result = await admin
        .from("sticky_group_participants")
        .select("participant_user_id")
        .order("participant_user_id", { ascending: true })
        .range(from, to);
      return { data: result.data, error: result.error };
    }),
  ]);

  return {
    participants,
    visitors,
    modUserIds: new Set(permissions.map((row) => row.user_id)),
    stickyParticipantIds: new Set(
      sticky.map((row) => row.participant_user_id)
    ),
  };
};
