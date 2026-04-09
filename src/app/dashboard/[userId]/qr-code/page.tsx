import { signCheckInJwt } from "@/lib/checkin-jwt";
import QrCodePreview from "./qr-code-preview";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function DashboardQrCodePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const cookieStore = await cookies();
  const visitorTokenCookie = cookieStore.get("visitor_token")?.value?.trim();

  if (!visitorTokenCookie) {
    notFound();
  }

  const adminClient = await createAdminClient();
  const { data: visitorData } = await adminClient
    .from("visitor_data")
    .select("id, visitor_token, email_verified")
    .eq("id", userId)
    .eq("visitor_token", visitorTokenCookie)
    .maybeSingle();

  if (!visitorData || visitorData.email_verified !== true) {
    notFound();
  }

  const token = signCheckInJwt(
    { sub: visitorData.id },
    60 * 60 * 12
  );

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Your Event Check-In QR</h1>
        <p className="text-sm text-white/80">
          Present this QR to event organizers for secure attendance check-in.
        </p>
      </header>
      <QrCodePreview token={token} />
    </section>
  );
}
