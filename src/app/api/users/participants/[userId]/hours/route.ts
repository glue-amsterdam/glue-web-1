import { visitingHoursSchema } from "@/schemas/visitingHoursSchema";
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
      .from("visiting_hours")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching visiting hours:", error);
      return NextResponse.json(
        { error: "Failed to fetch visiting hours" },
        { status: 500 }
      );
    }

    if (!data) {
      console.log("No data found for userId:", userId);
      return NextResponse.json(
        { error: "Visiting hours not found" },
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return handleRequest(request, userId, "create");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return handleRequest(request, userId, "update");
}

async function handleRequest(
  request: Request,
  userId: string,
  action: "create" | "update"
) {
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const body = await request.json();
    const validatedData = visitingHoursSchema.parse(body);

    let result;
    if (action === "create") {
      result = await supabase
        .from("visiting_hours")
        .insert({ ...validatedData, user_id: userId })
        .select()
        .single();
    } else {
      result = await supabase
        .from("visiting_hours")
        .update(validatedData)
        .eq("user_id", userId)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error(
        `Error ${
          action === "create" ? "creating" : "updating"
        } visiting hours:`,
        error
      );
      return NextResponse.json(
        { error: `Failed to ${action} visiting hours` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "visiting hours not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid visiting hours", details: error.errors },
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
