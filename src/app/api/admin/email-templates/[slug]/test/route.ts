import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { config } from "@/env";
import { z } from "zod";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const testEmailSchema = z.object({
  testEmail: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  html_content: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const body = await request.json();

    const validatedData = testEmailSchema.parse(body);
    const { testEmail, subject, html_content } = validatedData;

    let finalSubject: string;
    let finalHtmlContent: string;

    // If subject and html_content are provided, use them (from form)
    // Otherwise, get from database or fallback
    if (subject && html_content) {
      finalSubject = subject;
      finalHtmlContent = html_content;
    } else {
      // Get the template from database
      const { data: templateData, error: templateError } = await supabase
        .from("email_templates")
        .select("subject, html_content")
        .eq("slug", slug)
        .single();

      if (templateError || !templateData) {
        // Fallback to default template
        const defaultTemplate = await getEmailTemplateWithFallback(slug);
        finalSubject = defaultTemplate.subject;
        finalHtmlContent = defaultTemplate.html_content;
      } else {
        finalSubject = templateData.subject;
        finalHtmlContent = templateData.html_content;
      }
    }

    // Process template: replace variables and process image tags
    const templateVariables: Record<string, string> = {
      email: testEmail,
      user_name: "Test User",
    };
    if (slug === "password-reset") {
      templateVariables.reset_link = `${config.baseUrl}/reset-password?token=test-token-placeholder`;
    }
    const htmlContent = processEmailTemplate(finalHtmlContent, templateVariables);

    try {
      await resend.emails.send({
        from: `GLUE <${config.baseEmail}>`,
        to: testEmail,
        subject: finalSubject,
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending test email:", emailError);
      return NextResponse.json(
        { error: "Failed to send test email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/admin/email-templates/[slug]/test:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while sending test email" },
      { status: 500 }
    );
  }
}
