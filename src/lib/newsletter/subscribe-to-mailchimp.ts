import { createHash } from "node:crypto";

export type NewsletterPayload = {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
};

export type NewsletterActionResult =
  | { status: 200; success: true; memberStatus: string }
  | { status: 400; success: false; error: string }
  | { status: 500; success: false; error: string };

const MAILCHIMP_COMPANY_MERGE_FIELD = "MMERGE6";
const MAILCHIMP_SUBSCRIBED_STATUS = "subscribed";

type MailchimpConfig = {
  apiKey: string;
  audienceId: string;
  serverPrefix: string;
};

type MailchimpMemberResponse = {
  status?: string;
  email_address?: string;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getMailchimpConfig = (): MailchimpConfig | null => {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID?.trim();
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX?.trim();

  if (!apiKey || !audienceId || !serverPrefix) {
    return null;
  }

  return {
    apiKey,
    audienceId,
    serverPrefix,
  };
};

const createSubscriberHash = (email: string): string =>
  createHash("md5").update(normalizeEmail(email)).digest("hex");

const getMailchimpErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { detail?: unknown; title?: unknown };
    const detail = typeof body.detail === "string" ? body.detail : null;
    const title = typeof body.title === "string" ? body.title : null;

    return detail ?? title ?? "Newsletter signup failed. Please try again.";
  } catch {
    return "Newsletter signup failed. Please try again.";
  }
};

const subscribeToMailchimp = async (
  payload: NewsletterPayload,
  config: MailchimpConfig,
): Promise<NewsletterActionResult> => {
  const normalizedEmail = normalizeEmail(payload.email);
  const subscriberHash = createSubscriberHash(normalizedEmail);
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.audienceId}/members/${subscriberHash}`;
  const credentials = Buffer.from(`newsletter:${config.apiKey}`).toString("base64");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: normalizedEmail,
      status: MAILCHIMP_SUBSCRIBED_STATUS,
      status_if_new: MAILCHIMP_SUBSCRIBED_STATUS,
      merge_fields: {
        FNAME: payload.firstName,
        LNAME: payload.lastName,
        [MAILCHIMP_COMPANY_MERGE_FIELD]: payload.companyName ?? "",
      },
    }),
  });

  if (response.ok) {
    const body = (await response.json()) as MailchimpMemberResponse;
    const memberStatus = body.status ?? MAILCHIMP_SUBSCRIBED_STATUS;
    const email = body.email_address ?? normalizedEmail;

    console.log(`[newsletter] ${email} → status: ${memberStatus}`);

    return { status: 200, success: true, memberStatus };
  }

  const error = await getMailchimpErrorMessage(response);
  const status = response.status === 400 ? 400 : 500;

  return { status, success: false, error };
};

export const subscribeToNewsletter = async (
  payload: NewsletterPayload,
): Promise<NewsletterActionResult> => {
  try {
    const config = getMailchimpConfig();

    if (!config) {
      return {
        status: 500,
        success: false,
        error: "Newsletter signup is not configured. Please try again later.",
      };
    }

    return await subscribeToMailchimp(
      { ...payload, email: normalizeEmail(payload.email) },
      config,
    );
  } catch {
    return {
      status: 500,
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
};

export const subscribeToNewsletterBestEffort = async (
  payload: NewsletterPayload,
  context: string,
): Promise<void> => {
  try {
    const result = await subscribeToNewsletter(payload);

    if (!result.success) {
      console.error(`[newsletter] ${context}:`, result.error);
    }
  } catch (error) {
    console.error(`[newsletter] ${context}:`, error);
  }
};
