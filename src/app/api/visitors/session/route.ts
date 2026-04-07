import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/adminClient";

const visitorCookieName = "visitor_token";

const sessionSchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = sessionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const supabase = await createAdminClient();
    const { data: row, error: findError } = await supabase
      .from("visitor_data")
      .select("id, email_verified")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    const found = row?.[0];

    if (findError) {
      console.error("POST /api/visitors/session lookup:", findError);
      return NextResponse.json(
        { error: "Could not continue. Try again later." },
        { status: 500 },
      );
    }

    if (!found) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          error:
            "No visitor profile for this email. Go back and sign up as a new visitor.",
        },
        { status: 404 },
      );
    }

    if (found.email_verified !== true) {
      return NextResponse.json(
        {
          code: "UNVERIFIED",
          error:
            "This email is not verified yet. Check your inbox or resend the confirmation email below.",
        },
        { status: 403 },
      );
    }

    const newToken = randomBytes(32).toString("hex");
    const { error: updateError } = await supabase
      .from("visitor_data")
      .update({ visitor_token: newToken })
      .eq("id", found.id);

    if (updateError) {
      console.error("POST /api/visitors/session update:", updateError);
      return NextResponse.json(
        { error: "Could not restore session. Try again later." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(visitorCookieName, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err) {
    console.error("POST /api/visitors/session:", err);
    return NextResponse.json(
      { error: "Could not restore session. Try again later." },
      { status: 500 },
    );
  }
}
