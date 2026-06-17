import { PlanSchema, type PlanType } from "@/schemas/plansSchema";
import { createClient } from "@/utils/supabase/server";

export const getPlanByIdForApply = async (
  planId: string
): Promise<PlanType | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("plan_id", planId)
    .maybeSingle();

  if (error || !data) {
    console.error("getPlanByIdForApply:", error);
    return null;
  }

  const parsed = PlanSchema.safeParse(data);
  if (!parsed.success) {
    console.error("getPlanByIdForApply parse:", parsed.error);
    return null;
  }

  if (!parsed.data.is_participant_enabled) {
    return null;
  }

  return parsed.data;
};
