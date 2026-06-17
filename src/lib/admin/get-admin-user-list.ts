import type { AdminUserListItem } from "@/types/admin-user";
import { buildAdminUserList } from "@/lib/admin/build-admin-user-list-item";
import { fetchAdminUserEnrichment } from "@/lib/admin/fetch-admin-user-enrichment";
import { listAllAuthUsers } from "@/lib/admin/list-all-auth-users";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getAdminUserList = async (
  admin: SupabaseClient
): Promise<AdminUserListItem[]> => {
  const authUsers = await listAllAuthUsers(admin);
  const authUserIds = authUsers.map((authUser) => authUser.id);
  const enrichment = await fetchAdminUserEnrichment(admin, authUserIds);
  return buildAdminUserList(authUsers, enrichment);
};
