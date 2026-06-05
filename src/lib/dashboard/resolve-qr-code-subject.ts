import { createAdminClient } from "@/utils/supabase/adminClient";

export type QrCodeSubject = {
  subjectUserId: string;
  legacyRedirectToAuthId: string | null;
};

export const resolveQrCodeSubject = async (
  sessionUserId: string,
  paramUserId: string,
  isModerator: boolean
): Promise<QrCodeSubject | null> => {
  if (paramUserId === sessionUserId) {
    return { subjectUserId: sessionUserId, legacyRedirectToAuthId: null };
  }

  if (isModerator) {
    const admin = await createAdminClient();

    const { data: visitorRow } = await admin
      .from("visitor_data")
      .select("auth_user_id")
      .eq("id", paramUserId)
      .maybeSingle();

    if (visitorRow?.auth_user_id) {
      return {
        subjectUserId: visitorRow.auth_user_id,
        legacyRedirectToAuthId: visitorRow.auth_user_id,
      };
    }

    const [{ data: visitorByAuth }, { data: participant }, authLookup] =
      await Promise.all([
        admin
          .from("visitor_data")
          .select("auth_user_id")
          .eq("auth_user_id", paramUserId)
          .maybeSingle(),
        admin
          .from("participant_details")
          .select("user_id")
          .eq("user_id", paramUserId)
          .maybeSingle(),
        admin.auth.admin.getUserById(paramUserId),
      ]);

    if (
      visitorByAuth?.auth_user_id ||
      participant?.user_id ||
      authLookup.data.user
    ) {
      return {
        subjectUserId: paramUserId,
        legacyRedirectToAuthId: null,
      };
    }

    return null;
  }

  const admin = await createAdminClient();
  const { data: legacyRow } = await admin
    .from("visitor_data")
    .select("auth_user_id")
    .eq("id", paramUserId)
    .eq("auth_user_id", sessionUserId)
    .maybeSingle();

  if (legacyRow?.auth_user_id) {
    return {
      subjectUserId: sessionUserId,
      legacyRedirectToAuthId: sessionUserId,
    };
  }

  return null;
};
