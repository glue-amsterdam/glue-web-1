import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { sendVisitorVerificationEmail } from "@/lib/visitor-verification-email";

const bodySchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const supabase = await createAdminClient();
    const { data: rows, error: findError } = await supabase
      .from("visitor_data")
      .select("id, full_name, email_verified, email")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    const found = rows?.[0];

    if (findError) {
      console.error("resend-verification lookup:", findError);
      return NextResponse.json(
        { error: "Could not send email. Try again later." },
        { status: 500 },
      );
    }

    if (!found) {
      return NextResponse.json(
        { code: "NOT_FOUND", error: "No visitor profile for this email." },
        { status: 404 },
      );
    }

    if (found.email_verified === true) {
      return NextResponse.json(
        {
          code: "ALREADY_VERIFIED",
          error: "This email is already verified. Use visitor sign-in instead.",
        },
        { status: 400 },
      );
    }

    const verificationToken = randomBytes(32).toString("hex");

    const { error: updateError } = await supabase
      .from("visitor_data")
      .update({ verification_token: verificationToken })
      .eq("id", found.id);

    if (updateError) {
      console.error("resend-verification update:", updateError);
      return NextResponse.json(
        { error: "Could not send email. Try again later." },
        { status: 500 },
      );
    }

    const emailResult = await sendVisitorVerificationEmail({
      to: found.email,
      fullName: found.full_name,
      verificationToken,
    });

    if (!emailResult.ok) {
      console.error("resend-verification email:", emailResult);
      return NextResponse.json(
        { error: "Could not send email. Try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/visitors/resend-verification:", err);
    return NextResponse.json(
      { error: "Could not send email. Try again later." },
      { status: 500 },
    );
  }
}
