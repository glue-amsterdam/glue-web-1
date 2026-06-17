import { getCheckInQrToken } from "@/lib/checkin/get-check-in-qr-token";
import { resolveVisitorDataSubjectAuthId } from "@/lib/dashboard/resolve-visitor-data-subject";
import { getAuthUserEmail } from "@/lib/users/get-auth-user-email";
import {
  ensureVisitorDataForAuthUser,
  loadVisitorHintsForAuthUser,
} from "@/lib/visitor/ensure-visitor-data";
import {
  isCheckInProfileComplete,
  REQUIRE_COMPLETE_PROFILE_FOR_QR,
} from "@/lib/visitor/is-check-in-profile-complete";
import { mapVisitorRowToProfileResponse } from "@/lib/visitor/map-visitor-row-to-profile";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");

    const { authUserId, status } = await resolveVisitorDataSubjectAuthId(
      supabase,
      user.id,
      targetUserId
    );

    if (status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (REQUIRE_COMPLETE_PROFILE_FOR_QR) {
      const subjectEmail =
        authUserId === user.id
          ? user.email
          : await getAuthUserEmail(authUserId);

      const hints = await loadVisitorHintsForAuthUser(authUserId, subjectEmail);
      const row = await ensureVisitorDataForAuthUser(
        authUserId,
        hints,
        subjectEmail
      );
      const profile = mapVisitorRowToProfileResponse(row, subjectEmail);

      if (!isCheckInProfileComplete(profile)) {
        return NextResponse.json(
          {
            error:
              "Complete your check-in profile before generating a QR code.",
          },
          { status: 422 }
        );
      }
    }

    const { token } = await getCheckInQrToken({
      subjectUserId: authUserId,
      sessionUserId: user.id,
      sessionEmail: user.email,
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("GET /api/users/check-in-qr:", err);
    const message =
      err instanceof Error
        ? err.message
        : "We could not prepare your check-in QR. Please try again.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
