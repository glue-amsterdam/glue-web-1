import { getHubHostContext } from "@/lib/hubs/get-hub-host-context";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { enforceScanDayGuard } from "@/lib/scan/enforce-scan-day-guard";
import { isEventScanAllowed } from "@/lib/scan/is-event-scan-allowed";
import { resolveVisitorFromToken } from "@/lib/scan/resolve-visitor-from-token";
import { scanDebug } from "@/lib/scan/scan-debug";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/** `jsonwebtoken` requires Node; Edge can fail verification silently or throw oddly. */
export const runtime = "nodejs";

const scanSchema = z.object({
  token: z.string().min(1),
  event_id: z.string().uuid(),
  time_zone: z.string().optional(),
});

const json400 = (
  error: string,
  code: string,
  debugMeta?: Record<string, unknown>,
) => {
  scanDebug("api/scan", `400:${code}`, debugMeta);
  return NextResponse.json({ error, code }, { status: 400 });
};

const jsonInsertError = (insertError: {
  code?: string;
  message?: string;
  details?: string;
}) => {
  if (insertError.code === "23503" || insertError.code === "23514") {
    return NextResponse.json(
      {
        error:
          "This QR code cannot be used for this scan target. Ask the visitor to refresh their check-in QR and try again.",
        code: "invalid_scan_target",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Could not register attendance. Please try again." },
    { status: 500 },
  );
};

export async function POST(request: Request) {
  scanDebug("api/scan", "request_received");

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return json400("Invalid QR request.", "invalid_json");
  }

  const parsedBody = scanSchema.safeParse(json);
  if (!parsedBody.success) {
    return json400("Invalid QR request.", "invalid_body", {
      zod: parsedBody.error.flatten(),
    });
  }

  const { token: rawToken, event_id, time_zone } = parsedBody.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    scanDebug("api/scan", "401:unauthorized", { event_id });
    return NextResponse.json(
      { error: "Please sign in to scan QR codes." },
      { status: 401 },
    );
  }

  scanDebug("api/scan", "auth_ok", { userId: user.id, event_id });

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id, organizer_id, co_organizers, location_id, dayId")
    .eq("id", event_id)
    .maybeSingle();

  if (eventError || !eventData) {
    return json400("Scan target not found.", "invalid_event", {
      supabaseMessage: eventError?.message,
      hasRow: Boolean(eventData),
    });
  }

  const [hubHost, isPlatformMod] = await Promise.all([
    getHubHostContext(supabase, user.id),
    getIsPlatformMod(supabase, user.id),
  ]);
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

  scanDebug("api/scan", "event_permissions", {
    organizer_id: eventData.organizer_id,
    isAllowed: allowed,
    isHubHost: hubHost.isHubHost,
    isPlatformMod,
  });

  if (!allowed) {
    scanDebug("api/scan", "403:forbidden", { userId: user.id, event_id });
    return NextResponse.json(
      { error: "You do not have permission to scan this QR code." },
      { status: 403 },
    );
  }

  const dayGuardResponse = await enforceScanDayGuard(
    supabase,
    eventData.dayId as string,
    time_zone,
  );
  if (dayGuardResponse) {
    return dayGuardResponse;
  }

  const adminClient = await createAdminClient();
  const visitorResult = await resolveVisitorFromToken(adminClient, rawToken);

  if ("status" in visitorResult) {
    return json400(visitorResult.error, visitorResult.code, visitorResult.debugMeta);
  }

  scanDebug("api/scan", "visitor_found", { visitor_id: visitorResult.visitorId });

  const { error: insertError } = await adminClient.from("event_attendance").insert({
    visitor_id: visitorResult.visitorId,
    event_id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      scanDebug("api/scan", "409:duplicate_attendance");
      return NextResponse.json(
        { error: "Visitor already checked in." },
        { status: 409 },
      );
    }

    console.error("Error inserting event attendance:", insertError);
    scanDebug("api/scan", "500:insert_error", {
      code: insertError.code,
      message: insertError.message,
    });
    return jsonInsertError(insertError);
  }

  scanDebug("api/scan", "200:success", {
    visitor_id: visitorResult.visitorId,
    event_id,
  });
  return NextResponse.json({ success: true }, { status: 200 });
}
