import { isVisitorAgeRange } from "@/lib/visitor/visitor-age-ranges";
import type { VisitorProfileApi } from "@/schemas/visitorSchemas";

/** When true, GET /api/users/check-in-qr rejects incomplete profiles. */
export const REQUIRE_COMPLETE_PROFILE_FOR_QR = true;

export const isCheckInProfileComplete = (profile: VisitorProfileApi): boolean => {
  const birthDate = profile.birthDate?.trim() ?? "";
  return Boolean(
    profile.firstName?.trim() &&
      profile.lastName?.trim() &&
      profile.email?.trim() &&
      isVisitorAgeRange(birthDate) &&
      profile.areaId?.trim()
  );
};
