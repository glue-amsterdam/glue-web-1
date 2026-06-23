import { TERMS_CACHE_TAG } from "@/lib/terms/get-cached-terms";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const termsSchema = z.object({
  content: z.string().min(1, "Terms and conditions content is required"),
});

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const body = await request.json();

    const validatedData = termsSchema.parse(body);

    // Check if a record exists
    const { data: existingData } = await auth.supabase
      .from("terms_and_conditions")
      .select("id")
      .limit(1)
      .single();

    if (existingData) {
      // Update existing record
      const { data, error } = await auth.supabase
        .from("terms_and_conditions")
        .update({
          content: validatedData.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag(TERMS_CACHE_TAG, "max");
      revalidatePath("/terms-and-conditions");
      revalidatePath("/sign-up");
      revalidatePath("/participate/apply");
      return NextResponse.json(data);
    }

    // Insert new record
    const { data, error } = await auth.supabase
      .from("terms_and_conditions")
      .insert({
        content: validatedData.content,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    revalidateTag(TERMS_CACHE_TAG, "max");
    revalidatePath("/terms-and-conditions");
    revalidatePath("/sign-up");
    revalidatePath("/participate/apply");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/admin/terms:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while updating terms and conditions" },
      { status: 500 }
    );
  }
}
