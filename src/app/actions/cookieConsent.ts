"use server";

import { cookies } from "next/headers";

export async function setCookieConsent(consent: boolean) {
  (await cookies()).set("session-cookie-consent", consent ? "true" : "false", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function getCookieConsent() {
  const cookieStore = await cookies();
  return cookieStore.get("session-cookie-consent")?.value === "true";
}

export type CookieConsentStatus = "pending" | "accepted" | "declined";

export async function getCookieConsentStatus(): Promise<CookieConsentStatus> {
  const cookieStore = await cookies();
  const value = cookieStore.get("session-cookie-consent")?.value;

  if (value === "true") {
    return "accepted";
  }

  if (value === "false") {
    return "declined";
  }

  return "pending";
}
