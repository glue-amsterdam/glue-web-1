import ScanCheckInClient from "@/app/dashboard/[userId]/events/[eventId]/scan/scan-checkin-client";

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
