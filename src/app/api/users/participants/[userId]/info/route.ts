import { userInfoSchema } from "@/schemas/userInfoSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_info")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user info:", error);
      return NextResponse.json(
        { error: "Failed to fetch user info" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "user info not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const body = await request.json();
    const validatedData = userInfoSchema.parse(body);

    // Ensure the user_id in the body matches the URL parameter
    if (validatedData.user_id !== userId) {
      return NextResponse.json(
        { error: "User ID in body does not match URL parameter" },
        { status: 400 }
      );
    }

    // Update the user info in the database
    const { data, error } = await supabase
      .from("user_info")
      .update(validatedData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user info:", error);
      return NextResponse.json(
        { error: "Failed to update user info" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "User info not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid user data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
