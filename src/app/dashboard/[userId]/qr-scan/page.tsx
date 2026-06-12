import { QrScanClient } from "@/app/dashboard/[userId]/qr-scan/qr-scan-client";
import { isDataDebugEnabled } from "@/lib/data-debug";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { getQrScanPageDataForUser } from "@/lib/scan/get-qr-scan-page-data-server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "QR Scan");
}

export default async function QrScanPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { userId } = await params;
  const { eventId } = await searchParams;

  const pageData = await getQrScanPageDataForUser(userId);

  return (
    <QrScanClient
      eventDays={pageData.eventDays}
      events={pageData.events}
      hubHost={pageData.hubHost}
      eventAttendanceCounts={pageData.eventAttendanceCounts}
      locationDayCounts={pageData.locationDayCounts}
      debugEnabled={isDataDebugEnabled()}
      initialEventId={eventId ?? null}
    />
  );
}
