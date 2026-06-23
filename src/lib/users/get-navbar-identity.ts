import { getDashboardHomePath } from "@/lib/users/get-dashboard-home-path";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";

export type NavbarIdentity = {
  isParticipant: boolean;
  isVisitorOnly: boolean;
  dashboardHref: string | null;
};

export const getNavbarIdentity = async (
  userId: string
): Promise<NavbarIdentity> => {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  const [visitorRowRes, participantDetailsRes] = await Promise.all([
    supabaseAdmin
      .from("visitor_data")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle(),
    supabase
      .from("participant_details")
      .select("user_id, status")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const visitorRow = visitorRowRes.data;
  const participantDetails = participantDetailsRes.data;

  const hasParticipantRow = Boolean(participantDetails);
  const isParticipant = hasParticipantRow;
  const isVisitorOnly = Boolean(visitorRow) && !hasParticipantRow;

  const participantStatus = participantDetails?.status ?? null;
  const isPendingParticipant =
    isParticipant && participantStatus === "pending";

  const hasDashboardAccess = isParticipant || Boolean(visitorRow);
  const dashboardHref = hasDashboardAccess
    ? getDashboardHomePath(userId, { isParticipant, isPendingParticipant })
    : null;

  return {
    isParticipant,
    isVisitorOnly,
    dashboardHref,
  };
};
