import {
  getAttendanceReportData,
  type AttendanceReportScopeFilter,
} from "@/lib/scan/get-attendance-report-data";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const reportQuerySchema = z.object({
  scope: z.enum(["all", "event", "location-day"]).default("all"),
  eventId: z.string().uuid().optional().nullable(),
  dayId: z.string().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
});

const emptyToNull = (value: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export async function GET(request: Request) {
  const mod = await requirePlatformMod();
  if (!mod.ok) return mod.response;

  const { searchParams } = new URL(request.url);
  const parsedQuery = reportQuerySchema.safeParse({
    scope: searchParams.get("scope") ?? "all",
    eventId: emptyToNull(searchParams.get("eventId")),
    dayId: emptyToNull(searchParams.get("dayId")),
    locationId: emptyToNull(searchParams.get("locationId")),
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid report filters", details: parsedQuery.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const report = await getAttendanceReportData(admin, {
    scope: parsedQuery.data.scope as AttendanceReportScopeFilter,
    eventId: parsedQuery.data.eventId,
    dayId: parsedQuery.data.dayId,
    locationId: parsedQuery.data.locationId,
  });

  return NextResponse.json(report);
}
