"use server";

import type { PlanType } from "@/schemas/plansSchema";
import { createClient } from "@/utils/supabase/server";

export async function getPlans(): Promise<PlanType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("Error fetching plans:", error);
    throw new Error("Failed to fetch plans");
  }

  return data as PlanType[];
}

export async function updatePlanOrder(
  planId: string,
  newOrder: number,
  oldOrder: number
): Promise<void> {
  const supabase = await createClient();

  // Start a transaction
  const { error } = await supabase.rpc("update_plan_order", {
    p_plan_id: planId,
    p_new_order: newOrder,
    p_old_order: oldOrder,
  });

  if (error) {
    console.error("Error updating plan order:", error);
    throw new Error("Failed to update plan order");
  }
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
      plan_type: plan.plan_type,
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

  // Eliminar el plan
  const { error: deleteError } = await supabase
    .from("plans")
    .delete()
    .eq("plan_id", planId);

  if (deleteError) {
    console.error("Error deleting plan:", deleteError);
    throw new Error("Failed to delete plan");
  }

  // Reordenar todos los planes después de la eliminación
  const { error: updateError } = await supabase.rpc(
    "update_plan_order_after_delete"
  );

  if (updateError) {
    console.error("Error updating plan order:", updateError);
    throw new Error("Failed to update plan order after deletion");
  }
}

export async function createPlan(
  newPlan: Omit<PlanType, "plan_id" | "order_by">
): Promise<PlanType> {
  const supabase = await createClient();

  // Get the maximum order_by value
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from("plans")
    .select("order_by")
    .order("order_by", { ascending: false })
    .limit(1);

  if (maxOrderError) {
    console.error("Error getting max order:", maxOrderError);
    throw new Error("Failed to create plan");
  }

  const newOrder = (maxOrderData[0]?.order_by || 0) + 1;

  // Insert the new plan with auto-generated UUID and the new order
  const { data, error } = await supabase
    .from("plans")
    .insert({ ...newPlan, order_by: newOrder })
    .select()
    .single();

  if (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }

  return data as PlanType;
}
