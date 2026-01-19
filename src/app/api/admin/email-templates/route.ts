import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const emailTemplateSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  description: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("slug", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in GET /api/admin/email-templates:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching email templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const validatedData = emailTemplateSchema.parse(body);

    const { data, error } = await supabase
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

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/admin/email-templates:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while creating email template" },
      { status: 500 }
    );
  }
}
