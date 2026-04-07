import { NextResponse } from "next/server";

const visitorCookieName = "visitor_token";

/** Clears the HttpOnly visitor session cookie. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(visitorCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
