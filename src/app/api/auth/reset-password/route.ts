import { sendPasswordResetEmail } from "@/lib/auth/send-password-reset-email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const result = await sendPasswordResetEmail(email.trim());

  if (!result.ok) {
    console.error("[reset-password] Failed to send email:", result);
    return NextResponse.json(
      { error: "Failed to send password reset email. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Password reset email sent" });
}
