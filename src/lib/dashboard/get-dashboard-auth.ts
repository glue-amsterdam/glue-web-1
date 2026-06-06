import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type DashboardAuth = {
  loggedInUserId: string;
  targetUserId: string;
  isMod: boolean;
  displayName: string;
  isPendingLimitedAccess: boolean;
  isParticipant: boolean;
  is_active: boolean;
  participantStatus: string | null;
};

export const getDashboardAuth = async (
  targetUserId: string
): Promise<DashboardAuth> => {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const loggedInUserId = user.id;

  const [
    visitorRowRes,
    participantDetailsRes,
    loggedUserInfoRes,
    isModerator,
  ] = await Promise.all([
    supabaseAdmin
      .from("visitor_data")
      .select(
        "id, email, first_name, last_name, display_name, full_name, auth_user_id"
      )
      .eq("auth_user_id", loggedInUserId)
      .maybeSingle(),
    supabase
      .from("participant_details")
      .select("status, is_active, slug, display_name")
      .eq("user_id", loggedInUserId)
      .maybeSingle(),
    supabase
      .from("user_info")
      .select("plan_type, user_name")
      .eq("user_id", loggedInUserId)
      .maybeSingle(),
    getIsPlatformMod(supabase, loggedInUserId),
  ]);

  const visitorRow = visitorRowRes.data;
  const participantDetails = participantDetailsRes.data;
  const loggedUserInfo = loggedUserInfoRes.data;

  const hasParticipantRow = Boolean(participantDetails);
  const isLegacyParticipant = loggedUserInfo?.plan_type === "participant";
  const isParticipant = hasParticipantRow || isLegacyParticipant;

  const displayName =
    getVisitorDisplayName(visitorRow ?? {}) ||
    participantDetails?.display_name ||
    loggedUserInfo?.user_name ||
    user.email ||
    "";

  const participantStatus = participantDetails?.status ?? null;
  const isPendingLimitedAccess =
    isParticipant && participantStatus === "pending" && !isModerator;

  return {
    loggedInUserId,
    targetUserId,
    isMod: isModerator,
    displayName,
    isPendingLimitedAccess,
    isParticipant,
    is_active: participantDetails?.is_active ?? false,
    participantStatus,
  };
};
