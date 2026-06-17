import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import type { SupabaseClient } from "@supabase/supabase-js";

export const resolveVisitorDataSubjectAuthId = async (
  supabase: SupabaseClient,
  sessionUserId: string,
  targetUserId: string | null
): Promise<{ authUserId: string; status: 200 | 403 }> => {
  if (!targetUserId || targetUserId === sessionUserId) {
    return { authUserId: sessionUserId, status: 200 };
  }

  const isModerator = await getIsPlatformMod(supabase, sessionUserId);
  if (!isModerator) {
    return { authUserId: sessionUserId, status: 403 };
  }

  return { authUserId: targetUserId, status: 200 };
};
