import { createClient } from "@/utils/supabase/server";
import { getAllDefaultEmailTemplates } from "@/utils/email-templates";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const emailTemplateSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  description: z.string().nullable().optional(),
});

export type EmailTemplateRow = {
  id: string;
  slug: string;
  subject: string;
  html_content: string;
  description: string | null;
  created_at?: string;
  updated_at: string;
};

export const fetchEmailTemplates = async (
  supabase?: SupabaseClient
): Promise<EmailTemplateRow[]> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("email_templates")
    .select("*")
    .order("slug", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return [];
    }
    throw error;
  }

  const existingTemplates = data || [];
  const existingSlugs = new Set(existingTemplates.map((t) => t.slug));
  const defaultTemplates = getAllDefaultEmailTemplates();

  const templatesToCreate = Object.entries(defaultTemplates)
    .filter(([slug]) => !existingSlugs.has(slug))
    .map(([slug, template]) => ({
      slug,
      subject: template.subject,
      html_content: template.html_content,
      description: template.description,
      updated_at: new Date().toISOString(),
    }));

  if (templatesToCreate.length > 0) {
    const { data: newTemplates, error: insertError } = await client
      .from("email_templates")
      .insert(templatesToCreate)
      .select();

    if (!insertError && newTemplates) {
      existingTemplates.push(...newTemplates);
      existingTemplates.sort((a, b) => a.slug.localeCompare(b.slug));
    }
  }

  return existingTemplates;
};

export const createEmailTemplate = async (
  input: z.infer<typeof emailTemplateSchema>,
  supabase?: SupabaseClient
): Promise<EmailTemplateRow> => {
  const client = supabase ?? (await createClient());
  const validatedData = emailTemplateSchema.parse(input);

  const { data, error } = await client
    .from("email_templates")
    .insert({
      slug: validatedData.slug,
      subject: validatedData.subject,
      html_content: validatedData.html_content,
      description: validatedData.description || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
