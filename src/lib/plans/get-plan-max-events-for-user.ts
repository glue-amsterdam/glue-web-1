import { createClient } from "@/utils/supabase/server";

const DEFAULT_PLAN_MAX_EVENTS = 6;

export const getPlanMaxEventsForUser = async (
  userId: string
): Promise<number> => {
  const supabase = await createClient();

  const { data: participantDetails, error: participantDetailsError } =
    await supabase
      .from("participant_details")
      .select("plan_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (participantDetailsError) {
    console.error(
      "getPlanMaxEventsForUser participant_details:",
      participantDetailsError
    );
    return 0;
  }

  if (!participantDetails?.plan_id) {
    return 0;
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("max_events")
    .eq("plan_id", participantDetails.plan_id)
    .maybeSingle();

  if (planError) {
    console.error("getPlanMaxEventsForUser plans:", planError);
    return 0;
  }

  if (plan?.max_events == null) {
    return DEFAULT_PLAN_MAX_EVENTS;
  }

  return plan.max_events;
};
