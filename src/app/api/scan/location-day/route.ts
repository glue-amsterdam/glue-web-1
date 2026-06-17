import { isHubHostForLocation } from "@/lib/hubs/get-hub-host-context";
import { enforceScanDayGuard } from "@/lib/scan/enforce-scan-day-guard";
import { resolveVisitorFromToken } from "@/lib/scan/resolve-visitor-from-token";
import { scanDebug } from "@/lib/scan/scan-debug";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const locationDayScanSchema = z.object({
  token: z.string().min(1),
  day_id: z.string().min(1),
  location_id: z.string().uuid(),
  time_zone: z.string().optional(),
});

const json400 = (
  error: string,
  code: string,
  debugMeta?: Record<string, unknown>,
) => {
  scanDebug("api/scan/location-day", `400:${code}`, debugMeta);
  return NextResponse.json({ error, code }, { status: 400 });
};

export async function POST(request: Request) {
  scanDebug("api/scan/location-day", "request_received");

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return json400("Invalid JSON body", "invalid_json");
  }

  const parsedBody = locationDayScanSchema.safeParse(json);
  if (!parsedBody.success) {
    return json400("Invalid request. Check QR and scan target.", "invalid_body", {
      zod: parsedBody.error.flatten(),
    });
  }

  const { token: rawToken, day_id, location_id, time_zone } = parsedBody.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isHostForLocation = await isHubHostForLocation(
    supabase,
    user.id,
    location_id,
  );

  if (!isHostForLocation) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: dayRow, error: dayError } = await supabase
    .from("events_days")
    .select("dayId")
    .eq("dayId", day_id)
    .maybeSingle();

  if (dayError || !dayRow) {
    return json400("Event day not found.", "invalid_day");
  }

  const dayGuardResponse = await enforceScanDayGuard(supabase, day_id, time_zone);
  if (dayGuardResponse) {
    return dayGuardResponse;
  }

  const adminClient = await createAdminClient();
  const visitorResult = await resolveVisitorFromToken(adminClient, rawToken);

  if ("status" in visitorResult) {
    return json400(visitorResult.error, visitorResult.code, visitorResult.debugMeta);
  }

  const { error: insertError } = await adminClient
    .from("location_day_attendance")
    .insert({
      visitor_id: visitorResult.visitorId,
      day_id,
      location_id,
      scanned_by_user_id: user.id,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Visitor already checked in at this venue today" },
        { status: 409 },
      );
    }

    console.error("Error inserting location day attendance:", insertError);
    return NextResponse.json(
      { error: "Failed to register venue attendance" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
