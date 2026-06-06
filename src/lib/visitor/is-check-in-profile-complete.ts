import type { VisitorProfileApi } from "@/schemas/visitorSchemas";

/** When true, GET /api/users/check-in-qr rejects incomplete profiles. */
export const REQUIRE_COMPLETE_PROFILE_FOR_QR = false;

export const isCheckInProfileComplete = (profile: VisitorProfileApi): boolean => {
  return Boolean(
    profile.firstName?.trim() &&
      profile.lastName?.trim() &&
      profile.email?.trim()
    // Future: && profile.areaId?.trim() && profile.birthDate?.trim()
  );
};
