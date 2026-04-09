import { normalizeScannedJwt, verifyCheckInJwt } from "@/lib/checkin-jwt";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/** `jsonwebtoken` requires Node; Edge can fail verification silently or throw oddly. */
export const runtime = "nodejs";

/** Set `DATA_DEBUG=true` in `.env.local` to log scan flow (no JWT body / secrets). */
const isScanDebug =
  process.env.DATA_DEBUG === "true" || process.env.DATA_DEBUG === "1";

const scanDebug = (step: string, meta?: Record<string, unknown>) => {
  if (!isScanDebug) return;
  console.log(
    `[api/scan] ${step}`,
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : "",
  );
};

const scanSchema = z.object({
  token: z.string().min(1),
  event_id: z.string().uuid(),
});

const json400 = (
  error: string,
  code: string,
  debugMeta?: Record<string, unknown>,
) => {
  scanDebug(`400:${code}`, debugMeta);
  return NextResponse.json({ error, code }, { status: 400 });
};

export async function POST(request: Request) {
  scanDebug("request_received");

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return json400("Invalid JSON body", "invalid_json");
  }

  const parsedBody = scanSchema.safeParse(json);
  if (!parsedBody.success) {
    return json400("Invalid request. Check QR and event.", "invalid_body", {
      zod: parsedBody.error.flatten(),
    });
  }

  const rawToken = parsedBody.data.token;
  const normalizedToken = normalizeScannedJwt(rawToken);
  const tokenParts = normalizedToken.split(".");

  scanDebug("token_normalized", {
    rawLen: rawToken.length,
    normalizedLen: normalizedToken.length,
    partCount: tokenParts.length,
    partLengths: tokenParts.slice(0, 3).map((p) => p.length),
  });

  if (!normalizedToken.includes(".") || tokenParts.length < 3) {
    return json400(
      "Could not read QR token. Try again closer to the code.",
      "invalid_qr_shape",
      {
        partCount: tokenParts.length,
      },
    );
  }

  const { event_id } = parsedBody.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    scanDebug("401:unauthorized", { event_id });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  scanDebug("auth_ok", { userId: user.id, event_id });

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id, organizer_id, co_organizers")
    .eq("id", event_id)
    .maybeSingle();

  if (eventError || !eventData) {
    return json400("Event not found.", "invalid_event", {
      supabaseMessage: eventError?.message,
      hasRow: Boolean(eventData),
    });
  }

  const coOrganizers = Array.isArray(eventData.co_organizers)
    ? eventData.co_organizers
    : [];
  const isAllowedOrganizer =
    eventData.organizer_id === user.id || coOrganizers.includes(user.id);

  scanDebug("event_permissions", {
    organizer_id: eventData.organizer_id,
    co_organizers_count: coOrganizers.length,
    isAllowedOrganizer,
  });

  if (!isAllowedOrganizer) {
    scanDebug("403:forbidden", { userId: user.id, event_id });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let claim;
  try {
    claim = verifyCheckInJwt(normalizedToken);
    scanDebug("jwt_ok", { claimKind: claim.kind });
  } catch (jwtErr) {
    const name = jwtErr instanceof Error ? jwtErr.name : "unknown";
    const message = jwtErr instanceof Error ? jwtErr.message : String(jwtErr);
    scanDebug("jwt_verify_throw", { name, message });
    return json400(
      "QR expired or invalid. Ask the visitor to refresh their QR page and try again.",
      "invalid_jwt",
      { jwtErrorName: name },
    );
  }

  const adminClient = await createAdminClient();

  const visitorQuery =
    claim.kind === "visitor_id"
      ? adminClient
          .from("visitor_data")
          .select("id")
          .eq("id", claim.visitorId)
          .maybeSingle()
      : adminClient
          .from("visitor_data")
          .select("id")
          .eq("visitor_token", claim.visitorToken)
          .maybeSingle();

  const { data: visitorData, error: visitorError } = await visitorQuery;

  if (visitorError) {
    console.error("POST /api/scan visitor lookup:", visitorError);
    return json400("Could not verify visitor.", "visitor_lookup_error", {
      supabaseCode: visitorError.code,
      supabaseMessage: visitorError.message,
    });
  }

  if (!visitorData) {
    return json400(
      "Visitor not found. They may need a new QR (e.g. after logging in again).",
      "visitor_not_found",
      {
        claimKind: claim.kind,
        visitorId: claim.kind === "visitor_id" ? claim.visitorId : undefined,
      },
    );
  }

  scanDebug("visitor_found", { visitor_id: visitorData.id });

  const { error: insertError } = await adminClient
    .from("event_attendance")
    .insert({
      visitor_id: visitorData.id,
      event_id,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      scanDebug("409:duplicate_attendance");
      return NextResponse.json(
        { error: "Visitor already checked in" },
        { status: 409 },
      );
    }

    console.error("Error inserting event attendance:", insertError);
    scanDebug("500:insert_error", {
      code: insertError.code,
      message: insertError.message,
    });
    return NextResponse.json(
      { error: "Failed to register attendance" },
      { status: 500 },
    );
  }

  scanDebug("200:success", { visitor_id: visitorData.id, event_id });
  return NextResponse.json({ success: true }, { status: 200 });
}
