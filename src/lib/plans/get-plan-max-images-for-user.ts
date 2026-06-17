import { createClient } from "@/utils/supabase/server";

const DEFAULT_PLAN_MAX_IMAGES = 3;

export const getPlanMaxImagesForUser = async (
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
      "getPlanMaxImagesForUser participant_details:",
      participantDetailsError
    );
    return 0;
  }

  if (!participantDetails?.plan_id) {
    return 0;
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("plan_max_images")
    .eq("plan_id", participantDetails.plan_id)
    .maybeSingle();

  if (planError) {
    console.error("getPlanMaxImagesForUser plans:", planError);
    return 0;
  }

  if (plan?.plan_max_images == null) {
    return DEFAULT_PLAN_MAX_IMAGES;
  }

  return plan.plan_max_images;
};
