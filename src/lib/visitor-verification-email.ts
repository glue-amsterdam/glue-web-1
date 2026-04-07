import { Resend } from "resend";
import { config } from "@/env";

const resend = new Resend(process.env.RESEND_API_KEY);

const getVerifyEmailOrigin = (): string => {
  const origin = (config.baseUrl || "").replace(/\/$/, "");
  if (!origin) {
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not set; visitor verification links may be invalid.",
    );
  }
  return origin;
};

export type SendVisitorVerificationEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_api_key" | "send_failed"; message?: string };

/**
 * Sends a simple “confirm email” message (Resend). Link hits GET /api/visitors/verify.
 */
export const sendVisitorVerificationEmail = async (opts: {
  to: string;
  fullName: string;
  verificationToken: string;
}): Promise<SendVisitorVerificationEmailResult> => {
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn("RESEND_API_KEY is missing; skipping visitor verification email.");
    return { ok: false, reason: "missing_api_key" };
  }

  const origin = getVerifyEmailOrigin();
  const verifyPath = `/api/visitors/verify?token=${encodeURIComponent(opts.verificationToken)}`;
  const verifyUrl = origin ? `${origin}${verifyPath}` : verifyPath;

  const safeName = opts.fullName.trim() || "there";

  try {
    await resend.emails.send({
      from: `GLUE <${config.baseEmail}>`,
      to: opts.to,
      subject: "Confirm your email for GLUE",
      html: `
        <p>Hi ${escapeHtml(safeName)},</p>
        <p>Thanks for signing up as a visitor. Confirm your email address to finish:</p>
        <p><a href="${escapeHtml(verifyUrl)}">Confirm email</a></p>
        <p>If the button does not work, copy this link into your browser:</p>
        <p style="word-break:break-all;font-size:12px;color:#444;">${escapeHtml(verifyUrl)}</p>
        <p style="margin-top:24px;font-size:12px;color:#666;">If you did not request this, you can ignore this message.</p>
      `,
    });
    return { ok: true };
  } catch (err) {
    console.error("sendVisitorVerificationEmail:", err);
    return {
      ok: false,
      reason: "send_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
