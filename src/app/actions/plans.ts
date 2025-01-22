"use server";

import type { PlanType } from "@/schemas/plansSchema";
import { createClient } from "@/utils/supabase/server";

export async function getPlans(): Promise<PlanType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("plan_id");

  if (error) {
    console.error("Error fetching plans:", error);
    throw new Error("Failed to fetch plans");
  }

  return data as PlanType[];
}

export async function updatePlan(plan: PlanType): Promise<PlanType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .update({
      plan_label: plan.plan_label,
      plan_price: plan.plan_price,
      plan_currency: plan.plan_currency,
      currency_logo: plan.currency_logo,
      plan_description: plan.plan_description,
      plan_items: plan.plan_items,
      is_participant_enabled: plan.is_participant_enabled,
    })
    .eq("plan_id", plan.plan_id)
    .select()
    .single();

  if (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }

  return data as PlanType;
}

export async function deletePlan(planId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("plans").delete().eq("plan_id", planId);

  if (error) {
    console.error("Error deleting plan:", error);
    throw new Error("Failed to delete plan");
  }
}

export async function createPlan(
  newPlan: Omit<PlanType, "plan_id">
): Promise<PlanType> {
  const supabase = await createClient();

  // Obtener el último plan_id
  const { data: lastPlan, error: lastPlanError } = await supabase
    .from("plans")
    .select("plan_id")
    .order("plan_id", { ascending: false })
    .limit(1);

  if (lastPlanError) {
    console.error("Error fetching last plan:", lastPlanError);
    throw new Error("Failed to create plan");
  }

  // Generar el nuevo plan_id
  const lastPlanId = lastPlan?.[0]?.plan_id ?? "planId-1";
  const newPlanId = `planId-${Number.parseInt(lastPlanId.split("-")[1]) + 1}`;

  // Insertar el nuevo plan
  const { data, error } = await supabase
    .from("plans")
    .insert({ ...newPlan, plan_id: newPlanId })
    .select()
    .single();

  if (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }

  return data as PlanType;
}
