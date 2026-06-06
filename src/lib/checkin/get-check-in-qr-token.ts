import { signCheckInJwt } from "@/lib/checkin-jwt";
import { getAuthUserEmail } from "@/lib/users/get-auth-user-email";
import {
  ensureVisitorDataForAuthUser,
  loadVisitorHintsForAuthUser,
} from "@/lib/visitor/ensure-visitor-data";

const CHECK_IN_QR_TTL_SECONDS = 60 * 60 * 12;

export type GetCheckInQrTokenInput = {
  subjectUserId: string;
  sessionUserId: string;
  sessionEmail?: string | null;
};

export type GetCheckInQrTokenResult = {
  token: string;
  visitorDataId: string;
};

export const getCheckInQrToken = async ({
  subjectUserId,
  sessionUserId,
  sessionEmail,
}: GetCheckInQrTokenInput): Promise<GetCheckInQrTokenResult> => {
  const isViewingOther = subjectUserId !== sessionUserId;

  const subjectEmail = isViewingOther
    ? await getAuthUserEmail(subjectUserId)
    : sessionEmail;

  const hints = await loadVisitorHintsForAuthUser(subjectUserId, subjectEmail);
  const visitorData = await ensureVisitorDataForAuthUser(
    subjectUserId,
    hints,
    subjectEmail
  );

  const token = signCheckInJwt({ sub: visitorData.id }, CHECK_IN_QR_TTL_SECONDS);

  return { token, visitorDataId: visitorData.id };
};
