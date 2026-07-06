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
const MAILCHIMP_PENDING_STATUS = "pending";
const MAILCHIMP_FETCH_TIMEOUT_MS = 5_000;

type MailchimpConfig = {
  apiKey: string;
  audienceId: string;
  serverPrefix: string;
};

type MailchimpMemberResponse = {
  status?: string;
  email_address?: string;
};

type MailchimpMemberStatus =
  | "subscribed"
  | "unsubscribed"
  | "cleaned"
  | "pending"
  | "transactional";

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

const buildMemberUrl = (config: MailchimpConfig, subscriberHash: string): string =>
  `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.audienceId}/members/${subscriberHash}`;

const buildAuthHeader = (apiKey: string): string =>
  `Basic ${Buffer.from(`newsletter:${apiKey}`).toString("base64")}`;

const buildMergeFields = (payload: NewsletterPayload): Record<string, string> => ({
  FNAME: payload.firstName,
  LNAME: payload.lastName,
  [MAILCHIMP_COMPANY_MERGE_FIELD]: payload.companyName ?? "",
});

const mailchimpFetch = async (
  url: string,
  config: MailchimpConfig,
  init: RequestInit,
): Promise<Response> => {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(MAILCHIMP_FETCH_TIMEOUT_MS),
    headers: {
      Authorization: buildAuthHeader(config.apiKey),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
};

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

const isForgottenEmailError = (message: string): boolean =>
  /forgotten email/i.test(message) || /permanently deleted/i.test(message);

const logMemberTransition = (
  email: string,
  previousStatus: string | null,
  nextStatus: string,
): void => {
  if (previousStatus && previousStatus !== nextStatus) {
    console.log(`[newsletter] ${email} was ${previousStatus} → ${nextStatus}`);
    return;
  }

  console.log(`[newsletter] ${email} → status: ${nextStatus}`);
};

const successResult = (
  body: MailchimpMemberResponse,
  normalizedEmail: string,
  previousStatus: string | null,
): NewsletterActionResult => {
  const memberStatus = body.status ?? MAILCHIMP_SUBSCRIBED_STATUS;
  const email = body.email_address ?? normalizedEmail;
  logMemberTransition(email, previousStatus, memberStatus);

  return { status: 200, success: true, memberStatus };
};

const getMailchimpMember = async (
  config: MailchimpConfig,
  subscriberHash: string,
): Promise<MailchimpMemberResponse | null> => {
  const response = await mailchimpFetch(buildMemberUrl(config, subscriberHash), config, {
    method: "GET",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await getMailchimpErrorMessage(response);
    throw new Error(error);
  }

  return (await response.json()) as MailchimpMemberResponse;
};

const upsertMailchimpMember = async (
  config: MailchimpConfig,
  subscriberHash: string,
  normalizedEmail: string,
  body: Record<string, unknown>,
  previousStatus: string | null,
): Promise<NewsletterActionResult> => {
  const response = await mailchimpFetch(buildMemberUrl(config, subscriberHash), config, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const result = (await response.json()) as MailchimpMemberResponse;
    return successResult(result, normalizedEmail, previousStatus);
  }

  const error = await getMailchimpErrorMessage(response);
  const status = response.status === 400 ? 400 : 500;

  return { status, success: false, error };
};

const patchMailchimpMember = async (
  config: MailchimpConfig,
  subscriberHash: string,
  body: Record<string, unknown>,
  normalizedEmail: string,
  previousStatus: string | null,
): Promise<NewsletterActionResult> => {
  const response = await mailchimpFetch(buildMemberUrl(config, subscriberHash), config, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const result = (await response.json()) as MailchimpMemberResponse;
    return successResult(result, normalizedEmail, previousStatus);
  }

  const error = await getMailchimpErrorMessage(response);
  const status = response.status === 400 ? 400 : 500;

  return { status, success: false, error };
};

const subscribeToMailchimp = async (
  payload: NewsletterPayload,
  config: MailchimpConfig,
): Promise<NewsletterActionResult> => {
  const normalizedEmail = normalizeEmail(payload.email);
  const subscriberHash = createSubscriberHash(normalizedEmail);
  const mergeFields = buildMergeFields(payload);

  let existingMember: MailchimpMemberResponse | null;

  try {
    existingMember = await getMailchimpMember(config, subscriberHash);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reach newsletter service.";
    return { status: 500, success: false, error: message };
  }

  if (!existingMember) {
    return upsertMailchimpMember(
      config,
      subscriberHash,
      normalizedEmail,
      {
        email_address: normalizedEmail,
        status: MAILCHIMP_SUBSCRIBED_STATUS,
        status_if_new: MAILCHIMP_SUBSCRIBED_STATUS,
        merge_fields: mergeFields,
      },
      null,
    );
  }

  const currentStatus = existingMember.status as MailchimpMemberStatus | undefined;

  if (currentStatus === "subscribed" || currentStatus === "transactional") {
    return patchMailchimpMember(
      config,
      subscriberHash,
      { merge_fields: mergeFields },
      normalizedEmail,
      currentStatus,
    );
  }

  if (currentStatus === "unsubscribed") {
    return upsertMailchimpMember(
      config,
      subscriberHash,
      normalizedEmail,
      {
        email_address: normalizedEmail,
        status: MAILCHIMP_SUBSCRIBED_STATUS,
        merge_fields: mergeFields,
      },
      currentStatus,
    );
  }

  if (currentStatus === "pending") {
    return patchMailchimpMember(
      config,
      subscriberHash,
      { merge_fields: mergeFields },
      normalizedEmail,
      currentStatus,
    );
  }

  if (currentStatus === "cleaned") {
    return upsertMailchimpMember(
      config,
      subscriberHash,
      normalizedEmail,
      {
        email_address: normalizedEmail,
        status: MAILCHIMP_PENDING_STATUS,
        merge_fields: mergeFields,
      },
      currentStatus,
    );
  }

  const result = await upsertMailchimpMember(
    config,
    subscriberHash,
    normalizedEmail,
    {
      email_address: normalizedEmail,
      status: MAILCHIMP_SUBSCRIBED_STATUS,
      status_if_new: MAILCHIMP_SUBSCRIBED_STATUS,
      merge_fields: mergeFields,
    },
    currentStatus ?? null,
  );

  if (!result.success && isForgottenEmailError(result.error)) {
    return {
      status: 400,
      success: false,
      error:
        "This email cannot be re-subscribed via the API. Please use the newsletter signup form on our website.",
    };
  }

  return result;
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
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        status: 500,
        success: false,
        error: "Newsletter signup timed out. Please try again.",
      };
    }

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
