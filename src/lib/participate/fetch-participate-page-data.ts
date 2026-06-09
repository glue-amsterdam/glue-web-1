import type {
  ParticipatePageData,
  ParticipatePlanCard,
  ParticipatePlanDbRow,
  ParticipatePlansStatusRow,
} from "@/lib/participate/types";
import { formatParticipatePlanPrice } from "@/lib/participate/format-plan-price";
import {
  DEFAULT_BASE_PLAN_ITEMS,
  DEFAULT_BASE_PLAN_LABEL,
  DEFAULT_BASE_PLAN_SUBTITLE,
} from "@/lib/participate/participate-defaults";
import type { SupabaseClient } from "@supabase/supabase-js";

const BASE_PACKAGE_ID = "base-package";

const mapDbPlanToParticipateCard = (
  plan: ParticipatePlanDbRow
): ParticipatePlanCard => ({
  is_selectable: true,
  id: plan.plan_id,
  plan_label: plan.plan_label,
  plan_price: formatParticipatePlanPrice(plan.plan_price, plan.currency_logo),
  features: (plan.plan_items ?? []).map((item) => ({ label: item.label })),
});

export const mapStatusRowToBasePackage = (
  status: ParticipatePlansStatusRow | null | undefined
): ParticipatePlanCard => ({
  is_selectable: false,
  id: BASE_PACKAGE_ID,
  plan_label: status?.base_plan_label?.trim() || DEFAULT_BASE_PLAN_LABEL,
  plan_price: status?.base_plan_subtitle?.trim() || DEFAULT_BASE_PLAN_SUBTITLE,
  features:
    status?.base_plan_items && status.base_plan_items.length > 0
      ? status.base_plan_items.map((item) => ({ label: item.label }))
      : DEFAULT_BASE_PLAN_ITEMS,
});

export const fetchParticipatePageData = async (
  supabase: SupabaseClient
): Promise<ParticipatePageData> => {
  const { data: status, error: statusError } = await supabase
    .from("plans_status")
    .select(
      "application_closed, closed_message, base_plan_label, base_plan_subtitle, base_plan_items"
    )
    .single();

  if (statusError) {
    console.error("fetchParticipatePageData plans_status:", statusError);
  }

  const statusRow = status as ParticipatePlansStatusRow | null;
  const applicationClosed = statusRow?.application_closed ?? false;
  const closedMessage = statusRow?.closed_message ?? "";
  const basePackage = mapStatusRowToBasePackage(statusRow);

  if (applicationClosed) {
    return {
      applicationClosed: true,
      closedMessage,
      basePackage,
      selectablePlans: [],
    };
  }

  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select(
      "plan_id, plan_label, plan_price, plan_currency, currency_logo, plan_items, order_by"
    )
    .eq("is_participant_enabled", true)
    .order("order_by");

  if (plansError) {
    console.error("fetchParticipatePageData plans:", plansError);
    return {
      applicationClosed: false,
      closedMessage,
      basePackage,
      selectablePlans: [],
    };
  }

  return {
    applicationClosed: false,
    closedMessage,
    basePackage,
    selectablePlans: (plans ?? []).map((plan) =>
      mapDbPlanToParticipateCard(plan as ParticipatePlanDbRow)
    ),
  };
};
