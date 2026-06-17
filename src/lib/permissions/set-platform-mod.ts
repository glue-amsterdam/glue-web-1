import { createAdminClient } from "@/utils/supabase/adminClient";

export const setPlatformMod = async (
  targetUserId: string,
  isMod: boolean,
  grantedBy: string
): Promise<{ is_mod: boolean; granted_at: string }> => {
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("user_permissions")
    .upsert(
      {
        user_id: targetUserId,
        is_mod: isMod,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("is_mod, granted_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    is_mod: data.is_mod,
    granted_at: data.granted_at,
  };
};

export const getPlatformModStatus = async (
  targetUserId: string
): Promise<{ is_mod: boolean; granted_at: string | null }> => {
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("user_permissions")
    .select("is_mod, granted_at")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    is_mod: data?.is_mod === true,
    granted_at: data?.granted_at ?? null,
  };
};
