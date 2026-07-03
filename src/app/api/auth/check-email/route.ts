import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAuthUserExistsByEmail } from "@/lib/auth/check-email-exists";

const checkEmailSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkEmailSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const exists = await checkAuthUserExistsByEmail(normalizedEmail);
    return NextResponse.json({ exists });
  } catch (err) {
    console.error("POST /api/auth/check-email:", err);
    return NextResponse.json(
      { error: "Could not verify email. Try again later." },
      { status: 500 },
    );
  }
}
