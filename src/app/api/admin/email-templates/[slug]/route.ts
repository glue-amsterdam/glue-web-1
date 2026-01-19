import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const emailTemplateUpdateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  description: z.string().nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Email template not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/admin/email-templates/[slug]:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching email template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const body = await request.json();

    const validatedData = emailTemplateUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("email_templates")
      .update({
        subject: validatedData.subject,
        html_content: validatedData.html_content,
        description: validatedData.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Email template not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/admin/email-templates/[slug]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while updating email template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("slug", slug);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/email-templates/[slug]:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting email template" },
      { status: 500 }
    );
  }
}
