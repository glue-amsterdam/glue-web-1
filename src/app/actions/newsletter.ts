"use server";

import { z } from "zod";

import { subscribeToNewsletter } from "@/lib/newsletter/subscribe-to-mailchimp";

const newsletterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  companyName: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email address"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export async function submitNewsletter(data: NewsletterFormData) {
  const parsed = newsletterSchema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    return { status: 400, success: false as const, error: firstError };
  }

  return subscribeToNewsletter(parsed.data);
}
