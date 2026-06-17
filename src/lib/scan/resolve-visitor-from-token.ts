import { normalizeScannedJwt, verifyCheckInJwt } from "@/lib/checkin-jwt";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedVisitor = {
  visitorId: string;
  normalizedToken: string;
};

export type ResolveVisitorError = {
  status: 400;
  error: string;
  code: string;
  debugMeta?: Record<string, unknown>;
};

export const resolveVisitorFromToken = async (
  adminClient: SupabaseClient,
  rawToken: string,
): Promise<ResolvedVisitor | ResolveVisitorError> => {
  const normalizedToken = normalizeScannedJwt(rawToken);
  const tokenParts = normalizedToken.split(".");

  if (!normalizedToken.includes(".") || tokenParts.length < 3) {
    return {
      status: 400,
      error: "Could not read QR token. Try again closer to the code.",
      code: "invalid_qr_shape",
      debugMeta: { partCount: tokenParts.length },
    };
  }

  let claim;
  try {
    claim = verifyCheckInJwt(normalizedToken);
  } catch (jwtErr) {
    const name = jwtErr instanceof Error ? jwtErr.name : "unknown";
    return {
      status: 400,
      error:
        "QR expired or invalid. Ask the visitor to refresh their QR page and try again.",
      code: "invalid_jwt",
      debugMeta: { jwtErrorName: name },
    };
  }

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
    console.error("resolveVisitorFromToken:", visitorError);
    return {
      status: 400,
      error: "Could not verify visitor.",
      code: "visitor_lookup_error",
      debugMeta: {
        supabaseCode: visitorError.code,
        supabaseMessage: visitorError.message,
      },
    };
  }

  if (!visitorData) {
    return {
      status: 400,
      error:
        "Visitor not found. They may need a new QR (e.g. after logging in again).",
      code: "visitor_not_found",
      debugMeta: {
        claimKind: claim.kind,
        visitorId: claim.kind === "visitor_id" ? claim.visitorId : undefined,
      },
    };
  }

  return {
    visitorId: visitorData.id,
    normalizedToken,
  };
};
