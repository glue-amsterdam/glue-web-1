import type { SupabaseClient } from "@supabase/supabase-js";
import { buildAdminUserList } from "@/lib/admin/build-admin-user-list-item";
import { fetchAdminUserEnrichment } from "@/lib/admin/fetch-admin-user-enrichment";
import { listAllAuthUsers } from "@/lib/admin/list-all-auth-users";

export type StickyUserCatalogRow = {
  user_id: string;
  name: string;
  display_name: string | null;
  user_name: string | null;
  entity_type: "participant" | "visitor";
  slug: string | null;
};

export const fetchStickyUserCatalog = async (
  supabase: SupabaseClient
): Promise<StickyUserCatalogRow[]> => {
  const authUsers = await listAllAuthUsers(supabase);
  const authUserIds = authUsers.map((user) => user.id);
  const enrichment = await fetchAdminUserEnrichment(supabase, authUserIds);
  const adminUsers = buildAdminUserList(authUsers, enrichment);

  return adminUsers
    .filter((user) => user.displayName.trim() && user.displayName !== "Unnamed User")
    .map((user) => {
      const participant = enrichment.participantByUserId.get(user.userId);

      return {
        user_id: user.userId,
        name: user.displayName,
        display_name:
          participant?.display_name ??
          enrichment.visitorByUserId.get(user.userId)?.display_name ??
          null,
        user_name: null,
        entity_type: user.entityType,
        slug: participant?.slug ?? null,
      };
    });
};
