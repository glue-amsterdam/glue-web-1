import { redirect } from "next/navigation";

export default async function EventScanRedirectPage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}) {
  const { userId, eventId } = await params;
  redirect(`/dashboard/${userId}/qr-scan?eventId=${eventId}`);
}
