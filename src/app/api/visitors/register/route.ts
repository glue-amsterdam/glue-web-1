import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { sendVisitorVerificationEmail } from "@/lib/visitor-verification-email";

const registerSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(500),
  email: z.string().trim().email("Invalid email").max(320),
  birth_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be YYYY-MM-DD"),
  area_id: z.string().uuid("Work area is required"),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { full_name, email, birth_date, area_id } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const visitorToken = randomBytes(32).toString("hex");
  /** Opaque token for the “confirm email” link — not a login session. */
  const verificationToken = randomBytes(32).toString("hex");

  try {
    const supabase = await createAdminClient();

    const { data: existingRows } = await supabase
      .from("visitor_data")
      .select("id, email_verified")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    const existing = existingRows?.[0];

    if (existing?.email_verified === true) {
      return NextResponse.json(
        {
          error:
            "This email is already verified for a visitor profile. Use Log in if you have a full account, or contact support.",
        },
        { status: 409 },
      );
    }

    if (existing?.id) {
      const { data, error } = await supabase
        .from("visitor_data")
        .update({
          full_name,
          birth_date,
          area_id,
          visitor_token: visitorToken,
          verification_token: verificationToken,
          email_verified: false,
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      if (error) {
        if (error.code === "23503") {
          return NextResponse.json(
            { error: "Invalid work area selected." },
            { status: 400 },
          );
        }
        throw error;
      }

      const emailResult = await sendVisitorVerificationEmail({
        to: normalizedEmail,
        fullName: full_name,
        verificationToken,
      });
      if (!emailResult.ok) {
        console.error(
          "Visitor registration OK but verification email not sent:",
          emailResult,
        );
      }

      return NextResponse.json({
        id: data.id,
        resent: true,
        emailSent: emailResult.ok,
      });
    }

    const { data, error } = await supabase
      .from("visitor_data")
      .insert({
        full_name,
        email: normalizedEmail,
        birth_date,
        area_id,
        visitor_token: visitorToken,
        verification_token: verificationToken,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23503") {
        return NextResponse.json(
          { error: "Invalid work area selected." },
          { status: 400 },
        );
      }
      throw error;
    }

    const emailResult = await sendVisitorVerificationEmail({
      to: normalizedEmail,
      fullName: full_name,
      verificationToken,
    });
    if (!emailResult.ok) {
      console.error(
        "Visitor registration OK but verification email not sent:",
        emailResult,
      );
    }

    // visitor_token cookie is set in GET /api/visitors/verify after email_verified.
    return NextResponse.json({ id: data.id, emailSent: emailResult.ok });
  } catch (err) {
    console.error("POST /api/visitors/register:", err);
    return NextResponse.json(
      { error: "Could not complete registration. Try again later." },
      { status: 500 },
    );
  }
}
