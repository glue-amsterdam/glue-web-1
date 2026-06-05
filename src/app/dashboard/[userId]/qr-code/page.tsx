import { resolveQrCodeSubject } from "@/lib/dashboard/resolve-qr-code-subject";
import { signCheckInJwt } from "@/lib/checkin-jwt";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getAuthUserEmail } from "@/lib/users/get-auth-user-email";
import {
  ensureVisitorDataForAuthUser,
  loadVisitorHintsForAuthUser,
} from "@/lib/visitor/ensure-visitor-data";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { QrCodeError } from "./qr-code-error";
import QrCodePreview from "./qr-code-preview";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function DashboardQrCodePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: paramUserId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const isModerator = await getIsPlatformMod(supabase, user.id);
  const resolved = await resolveQrCodeSubject(
    user.id,
    paramUserId,
    isModerator
  );

  if (!resolved) {
    notFound();
  }

  if (
    resolved.legacyRedirectToAuthId &&
    paramUserId !== resolved.legacyRedirectToAuthId
  ) {
    redirect(`/dashboard/${resolved.legacyRedirectToAuthId}/qr-code`);
  }

  const { subjectUserId } = resolved;
  const isViewingOther = subjectUserId !== user.id;

  try {
    const subjectEmail = isViewingOther
      ? await getAuthUserEmail(subjectUserId)
      : user.email;

    const hints = await loadVisitorHintsForAuthUser(
      subjectUserId,
      subjectEmail
    );
    const visitorData = await ensureVisitorDataForAuthUser(
      subjectUserId,
      hints,
      subjectEmail
    );

    const token = signCheckInJwt({ sub: visitorData.id }, 60 * 60 * 12);

    let subjectDisplayName: string | null = null;
    if (isViewingOther && isModerator) {
      const admin = await createAdminClient();
      const [visitorRes, participantRes] = await Promise.all([
        admin
          .from("visitor_data")
          .select(
            "first_name, last_name, display_name, full_name, email"
          )
          .eq("auth_user_id", subjectUserId)
          .maybeSingle(),
        admin
          .from("participant_details")
          .select("display_name")
          .eq("user_id", subjectUserId)
          .maybeSingle(),
      ]);
      subjectDisplayName =
        participantRes.data?.display_name ||
        getVisitorDisplayName(visitorRes.data ?? {}) ||
        null;
    }

    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 text-white">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {isViewingOther && subjectDisplayName
              ? `Check-in QR for ${subjectDisplayName}`
              : "Your Event Check-In QR"}
          </h1>
          <p className="text-sm text-white/80">
            {isViewingOther
              ? "QR code for event check-in (moderator view)."
              : "Present this QR to event organizers for secure attendance check-in."}
          </p>
        </header>
        <QrCodePreview token={token} />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not prepare your check-in QR. Please try again.";

    return (
      <QrCodeError userId={subjectUserId} message={message} />
    );
  }
}
