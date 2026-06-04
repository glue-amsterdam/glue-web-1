"use server";

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

const SIMULATED_RESPONSE_DELAY_MS = 300;

const delay = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });

export async function submitNewsletter(
    data: NewsletterPayload
): Promise<NewsletterActionResult> {
    try {
        const parsed = newsletterSchema.safeParse(data);

        if (!parsed.success) {
            const firstError = parsed.error.errors[0]?.message ?? "Validation failed";
            return { status: 400, success: false, error: firstError };
        }

        console.log(parsed.data);

        await delay(SIMULATED_RESPONSE_DELAY_MS);

        return { status: 200, success: true };
    } catch {
        return {
            status: 500,
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}
