import ScanCheckInClient from "@/app/dashboard/[userId]/events/[eventId]/scan/scan-checkin-client";
import { getParticipantEventById } from "@/lib/events/get-participant-event-by-id";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}): Promise<Metadata> {
  const { userId, eventId } = await params;
  const event = await getParticipantEventById(userId, eventId);
  const sectionLabel = event?.title
    ? `Scan Check-Ins — ${event.title}`
    : "Scan Check-Ins";
  return generateDashboardSectionMetadata(userId, sectionLabel);
}

export default async function EventScanPage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6 text-white">
      <h1 className="text-2xl font-semibold">Scan Event Check-Ins</h1>
      <p className="text-sm text-white/80">
        Scan visitor QR codes for this event. Attendance is linked to this event
        automatically.
      </p>
      <ScanCheckInClient eventId={eventId} />
    </section>
  );
}
