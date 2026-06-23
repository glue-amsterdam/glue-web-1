import { isHubHostForLocation, getHubHostContext } from "@/lib/hubs/get-hub-host-context";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getAttendanceReportData } from "@/lib/scan/get-attendance-report-data";
import { isEventScanAllowed } from "@/lib/scan/is-event-scan-allowed";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const eventReportSchema = z.object({
  scope: z.literal("event"),
  eventId: z.string().uuid(),
});

const locationDayReportSchema = z.object({
  scope: z.literal("location-day"),
  locationId: z.string().uuid(),
  dayId: z.string().min(1),
});

const reportQuerySchema = z.union([eventReportSchema, locationDayReportSchema]);

const parseReportQuery = (request: Request) => {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "event") {
    return reportQuerySchema.safeParse({
      scope,
      eventId: searchParams.get("eventId"),
    });
  }

  return reportQuerySchema.safeParse({
    scope,
    locationId: searchParams.get("locationId"),
    dayId: searchParams.get("dayId"),
  });
};

export async function GET(request: Request) {
  const parsedQuery = parseReportQuery(request);
  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid report request", details: parsedQuery.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPlatformMod = await getIsPlatformMod(supabase, user.id);

  if (parsedQuery.data.scope === "event") {
    const { eventId } = parsedQuery.data;
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id, organizer_id, co_organizers, location_id")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !eventData) {
      return NextResponse.json({ error: "Report target not found" }, { status: 404 });
    }

    const hubHost = await getHubHostContext(supabase, user.id);
    const allowed =
      isPlatformMod ||
      isEventScanAllowed(
        user.id,
        {
          organizer_id: eventData.organizer_id as string,
          co_organizers: eventData.co_organizers as string[] | null,
          location_id: eventData.location_id as string,
        },
        hubHost.hostedLocationIds,
      );

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();
    const report = await getAttendanceReportData(admin, {
      scope: "event",
      eventId,
    });

    return NextResponse.json(report);
  }

  const { locationId, dayId } = parsedQuery.data;
  const isHostForLocation = await isHubHostForLocation(supabase, user.id, locationId);
  if (!isHostForLocation && !isPlatformMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: dayRow, error: dayError } = await supabase
    .from("events_days")
    .select("dayId")
    .eq("dayId", dayId)
    .maybeSingle();

  if (dayError || !dayRow) {
    return NextResponse.json({ error: "Report day not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const report = await getAttendanceReportData(admin, {
    scope: "location-day",
    locationId,
    dayId,
  });

  return NextResponse.json(report);
}
