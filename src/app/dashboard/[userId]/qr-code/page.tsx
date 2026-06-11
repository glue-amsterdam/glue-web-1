import { resolveQrCodeSubject } from "@/lib/dashboard/resolve-qr-code-subject";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "QR Code");
}

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

  const destinationUserId =
    resolved.legacyRedirectToAuthId ?? resolved.subjectUserId;

  redirect(`/dashboard/${destinationUserId}/visitor-data`);
}
