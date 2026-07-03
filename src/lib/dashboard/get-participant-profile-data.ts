import type { InvoiceData } from "@/schemas/invoiceSchemas";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import type { PlanType } from "@/schemas/plansSchema";
import type { VisitingHoursDays } from "@/schemas/visitingHoursSchema";
import { getPlanMaxImagesForUser } from "@/lib/plans/get-plan-max-images-for-user";
import { toMediaUrl } from "@/lib/media/media-url";
import { createClient } from "@/utils/supabase/server";

export type ProfileImageRow = {
  id: string;
  image_url: string;
};

export type ParticipantProfileData = {
  participantDetails: ParticipantDetails | null;
  visitingHours: VisitingHoursDays[];
  invoiceData: InvoiceData | null;
  profileImages: ProfileImageRow[];
  planMaxImages: number;
  plans: PlanType[];
};

export const getParticipantProfileData = async (
  userId: string,
  options?: { includePlans?: boolean }
): Promise<ParticipantProfileData> => {
  const supabase = await createClient();

  const [
    participantDetailsRes,
    visitingHoursRes,
    invoiceDataRes,
    profileImagesRes,
    planMaxImages,
    plansRes,
  ] = await Promise.all([
    supabase
      .from("participant_details")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("visiting_hours").select("*").eq("user_id", userId),
    supabase
      .from("invoice_data")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("participant_image")
      .select("id, image_url")
      .eq("user_id", userId)
      .order("created_at"),
    getPlanMaxImagesForUser(userId),
    options?.includePlans
      ? supabase.from("plans").select("*").order("order_by")
      : Promise.resolve({ data: [] as PlanType[], error: null }),
  ]);

  return {
    participantDetails: participantDetailsRes.data ?? null,
    visitingHours: visitingHoursRes.data ?? [],
    invoiceData: invoiceDataRes.data ?? null,
    profileImages: (profileImagesRes.data ?? []).map((image) => ({
      ...image,
      image_url: toMediaUrl(image.image_url) ?? "",
    })),
    planMaxImages,
    plans: (plansRes.data ?? []) as PlanType[],
  };
};
