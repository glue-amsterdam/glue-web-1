"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createEmailTemplate,
  emailTemplateSchema,
  fetchEmailTemplates,
} from "@/lib/email/fetch-email-templates-admin";

export async function getEmailTemplates() {
  await requireAdmin();
  return fetchEmailTemplates();
}

export async function addEmailTemplate(
  data: {
    slug: string;
    subject: string;
    html_content: string;
    description?: string | null;
  }
) {
  await requireAdmin();
  emailTemplateSchema.parse(data);
  return createEmailTemplate(data);
}
