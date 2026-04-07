import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { config } from "@/env";

const visitorCookieName = "visitor_token";

const getPublicBaseUrl = (request: Request): string => {
  const fromEnv = (config.baseUrl || "").replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  return new URL(request.url).origin;
};

const redirectWithVisitorCookie = (
  request: Request,
  pathname: string,
  visitorToken: string,
) => {
  const base = getPublicBaseUrl(request);
  const response = NextResponse.redirect(new URL(pathname, base));
  response.cookies.set(visitorCookieName, visitorToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
};

const redirectPlain = (request: Request, pathname: string) => {
  const base = getPublicBaseUrl(request);
  return NextResponse.redirect(new URL(pathname, base));
};

/**
 * Email link target: confirms visitor email and sets HttpOnly visitor_token cookie.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();

  if (!token) {
    return redirectPlain(request, "/visitors/verify?error=missing");
  }

  try {
    const supabase = await createAdminClient();

    const { data: row, error: findError } = await supabase
      .from("visitor_data")
      .select("id, visitor_token, email_verified")
      .eq("verification_token", token)
      .maybeSingle();

    if (findError) {
      console.error("verify visitor lookup:", findError);
      return redirectPlain(request, "/visitors/verify?error=server");
    }

    if (!row) {
      return redirectPlain(request, "/visitors/verify?error=invalid");
    }

    if (row.email_verified === true) {
      return redirectWithVisitorCookie(
        request,
        "/visitors/verified?already=1",
        row.visitor_token,
      );
    }

    const { error: updateError } = await supabase
      .from("visitor_data")
      .update({
        email_verified: true,
        verification_token: null,
      })
      .eq("id", row.id);

    if (updateError) {
      console.error("verify visitor update:", updateError);
      return redirectPlain(request, "/visitors/verify?error=server");
    }

    return redirectWithVisitorCookie(
      request,
      "/visitors/verified",
      row.visitor_token,
    );
  } catch (err) {
    console.error("GET /api/visitors/verify:", err);
    return redirectPlain(request, "/visitors/verify?error=server");
  }
}
