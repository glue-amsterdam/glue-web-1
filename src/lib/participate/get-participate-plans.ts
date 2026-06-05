import type {
  ParticipatePlanCard,
  ParticipatePlanDbRow,
  ParticipatePlansPayload,
} from "@/lib/participate/types";
import { formatParticipatePlanPrice } from "@/lib/participate/format-plan-price";
import { createClient } from "@/utils/supabase/server";

const mapDbPlanToParticipateCard = (
  plan: ParticipatePlanDbRow
): ParticipatePlanCard => ({
  is_selectable: true,
  id: plan.plan_id,
  plan_label: plan.plan_label,
  plan_price: formatParticipatePlanPrice(plan.plan_price, plan.currency_logo),
  features: (plan.plan_items ?? []).map((item) => ({ label: item.label })),
});

export const getParticipatePlans = async (): Promise<ParticipatePlansPayload> => {
  const supabase = await createClient();

  const { data: status, error: statusError } = await supabase
    .from("plans_status")
    .select("application_closed, closed_message")
    .single();

  if (statusError) {
    console.error("getParticipatePlans plans_status:", statusError);
  }

  const applicationClosed = status?.application_closed ?? false;
  const closedMessage = status?.closed_message ?? "";

  if (applicationClosed) {
    return {
      applicationClosed: true,
      closedMessage,
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
    console.error("getParticipatePlans plans:", plansError);
    return {
      applicationClosed: false,
      closedMessage: "",
      selectablePlans: [],
    };
  }

  return {
    applicationClosed: false,
    closedMessage,
    selectablePlans: (plans ?? []).map((plan) =>
      mapDbPlanToParticipateCard(plan as ParticipatePlanDbRow)
    ),
  };
};
