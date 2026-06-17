import { createAdminClient } from "@/utils/supabase/adminClient";

export const getAuthUserEmail = async (
  authUserId: string
): Promise<string | null> => {
  const admin = await createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(authUserId);

  if (error || !data.user) {
    return null;
  }

  return data.user.email ?? null;
};
