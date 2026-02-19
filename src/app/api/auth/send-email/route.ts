import { config } from "@/env";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailHookPayload = {
  user: {
    id: string;
    email?: string;
    user_metadata?: { user_name?: string };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
};

/** Extract signing secret for Standard Webhooks (Supabase uses "v1,whsec_<base64>") */
const getHookSecret = (): string => {
  const raw = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!raw?.trim()) {
    throw new Error("SEND_EMAIL_HOOK_SECRET is not set");
  }
  return raw.replace(/^v1,whsec_/i, "");
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const secret = getHookSecret();
    const wh = new Webhook(secret);
    wh.verify(rawBody, headers);

    const body = JSON.parse(rawBody) as SendEmailHookPayload;
    const { user, email_data } = body;

    if (!user?.email) {
      return NextResponse.json(
        { error: "Missing user email" },
        { status: 400 },
      );
    }

    const { email_action_type, redirect_to, token } = email_data || {};

    if (email_action_type === "recovery") {
      const resetLink =
        redirect_to && token
          ? `${redirect_to}?token=${encodeURIComponent(token)}`
          : redirect_to || "";

      const template = await getEmailTemplateWithFallback("password-reset");
      const htmlContent = processEmailTemplate(template.html_content, {
        email: user.email,
        user_name: user.user_metadata?.user_name ?? user.email,
        reset_link: resetLink,
      });

      await resend.emails.send({
        from: `GLUE <${config.baseEmail}>`,
        to: user.email,
        subject: template.subject,
        html: htmlContent,
      });
    }
    // Other email_action_type values (signup, invite, etc.) can be handled here

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }
    console.error("Error in send-email hook:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
