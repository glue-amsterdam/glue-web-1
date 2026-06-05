import type { SupabaseClient } from "@supabase/supabase-js";

export const getIsPlatformMod = async (
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> => {
  const { data: permissions } = await supabase
    .from("user_permissions")
    .select("is_mod")
    .eq("user_id", userId)
    .maybeSingle();

  return permissions?.is_mod === true;
};
