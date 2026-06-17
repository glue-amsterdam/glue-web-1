import type { SupabaseClient } from "@supabase/supabase-js";

export const getPlansStatusId = async (
  supabase: SupabaseClient
): Promise<string> => {
  const { data, error } = await supabase
    .from("plans_status")
    .select("id")
    .single();

  if (error || !data?.id) {
    throw error ?? new Error("plans_status row not found");
  }

  return data.id as string;
};
