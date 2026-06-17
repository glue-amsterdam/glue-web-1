import { config } from "@/config";
import { createAdminClient } from "@/utils/supabase/adminClient";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendPasswordResetEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_api_key" | "send_failed"; message?: string };

const getResetRedirectTo = (): string =>
  `${config.baseUrl.replace(/\/$/, "")}/reset-password`;

export const buildPasswordResetLink = (
  redirectTo: string,
  token: string,
): string => {
  const base = redirectTo.replace(/\/$/, "") || getResetRedirectTo();
  return `${base}?token=${encodeURIComponent(token)}`;
};

export const deliverPasswordResetEmail = async (opts: {
  email: string;
  userName?: string;
  resetLink: string;
}): Promise<SendPasswordResetEmailResult> => {
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn(
      "[deliverPasswordResetEmail] RESEND_API_KEY is missing; cannot send reset email.",
    );
    return { ok: false, reason: "missing_api_key" };
  }

  const userEmail = opts.email.trim();
  const userName = opts.userName?.trim() || userEmail;

  try {
    const template = await getEmailTemplateWithFallback("password-reset");
    const htmlContent = processEmailTemplate(template.html_content, {
      email: userEmail,
      user_name: userName,
      reset_link: opts.resetLink,
    });

    await resend.emails.send({
      from: `GLUE <${config.baseEmail}>`,
      to: userEmail,
      subject: template.subject,
      html: htmlContent,
    });

    return { ok: true };
  } catch (err) {
    console.error("[deliverPasswordResetEmail] Resend error:", err);
    return {
      ok: false,
      reason: "send_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

/**
 * Generates a recovery OTP via the Admin API and sends the reset email through Resend.
 * Does not use Supabase's Send Email Hook, so it works even when the hook URL is misconfigured.
 */
export const sendPasswordResetEmail = async (
  email: string,
): Promise<SendPasswordResetEmailResult> => {
  const redirectTo = getResetRedirectTo();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    // Avoid leaking whether the account exists.
    console.warn("[sendPasswordResetEmail] generateLink:", error.message);
    return { ok: true };
  }

  const properties = data.properties as {
    email_otp?: string;
    action_link?: string;
  };

  const token = properties.email_otp?.trim();
  const resetLink =
    token && redirectTo
      ? buildPasswordResetLink(redirectTo, token)
      : properties.action_link || redirectTo;

  const userEmail = data.user?.email ?? email;
  const userName =
    (data.user?.user_metadata?.user_name as string | undefined) ?? userEmail;

  return deliverPasswordResetEmail({
    email: userEmail,
    userName,
    resetLink,
  });
};
