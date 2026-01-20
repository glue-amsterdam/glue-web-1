import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const termsSchema = z.object({
  content: z.string().min(1, "Terms and conditions content is required"),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("terms_and_conditions")
      .select("*")
      .single();

    if (error) {
      // If table doesn't exist or no record found, return default
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({
          content: "<p>Terms and conditions content will be displayed here.</p>",
        });
      }
      throw error;
    }

    return NextResponse.json(data || { content: "" });
  } catch (error) {
    console.error("Error in GET /api/admin/terms:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching terms and conditions" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const validatedData = termsSchema.parse(body);

    // Check if a record exists
    const { data: existingData } = await supabase
      .from("terms_and_conditions")
      .select("id")
      .limit(1)
      .single();

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from("terms_and_conditions")
        .update({
          content: validatedData.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("terms_and_conditions")
        .insert({
          content: validatedData.content,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error in PUT /api/admin/terms:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while updating terms and conditions" },
      { status: 500 }
    );
  }
}
