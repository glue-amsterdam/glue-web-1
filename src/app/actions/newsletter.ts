"use server";

import { createHash } from "node:crypto";

import { z } from "zod";

const newsletterSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    companyName: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email address"),
});

export type NewsletterPayload = z.infer<typeof newsletterSchema>;

export type NewsletterActionResult =
    | { status: 200; success: true }
    | { status: 400; success: false; error: string }
    | { status: 500; success: false; error: string };

const MAILCHIMP_COMPANY_MERGE_FIELD = "MMERGE6";
const MAILCHIMP_SUBSCRIBED_STATUS = "subscribed";

type MailchimpConfig = {
    apiKey: string;
    audienceId: string;
    serverPrefix: string;
};

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
    createHash("md5").update(email.toLowerCase()).digest("hex");

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
    config: MailchimpConfig
): Promise<NewsletterActionResult> => {
    const subscriberHash = createSubscriberHash(payload.email);
    const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.audienceId}/members/${subscriberHash}`;
    const credentials = Buffer.from(`newsletter:${config.apiKey}`).toString("base64");

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email_address: payload.email,
            status_if_new: MAILCHIMP_SUBSCRIBED_STATUS,
            merge_fields: {
                FNAME: payload.firstName,
                LNAME: payload.lastName,
                [MAILCHIMP_COMPANY_MERGE_FIELD]: payload.companyName ?? "",
            },
        }),
    });

    if (response.ok) {
        return { status: 200, success: true };
    }

    const error = await getMailchimpErrorMessage(response);
    const status = response.status === 400 ? 400 : 500;

    return { status, success: false, error };
};

export async function submitNewsletter(
    data: NewsletterPayload
): Promise<NewsletterActionResult> {
    try {
        const parsed = newsletterSchema.safeParse(data);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
            return { status: 400, success: false, error: firstError };
        }

        const config = getMailchimpConfig();

        if (!config) {
            return {
                status: 500,
                success: false,
                error: "Newsletter signup is not configured. Please try again later.",
            };
        }

        return await subscribeToMailchimp(parsed.data, config);
    } catch {
        return {
            status: 500,
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}
