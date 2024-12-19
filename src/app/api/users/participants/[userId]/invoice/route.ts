import { invoiceData } from "@/schemas/invoiceSchemas";
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
      .from("invoice_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching invoice data:", error);
      return NextResponse.json(
        { error: "Failed to fetch invoice data" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "invoice data not found" },
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
    const validatedData = invoiceData.parse(body);

    let result;
    if (action === "create") {
      result = await supabase
        .from("invoice_data")
        .insert({ ...validatedData, user_id: userId })
        .select()
        .single();
    } else {
      result = await supabase
        .from("invoice_data")
        .update(validatedData)
        .eq("user_id", userId)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error(
        `Error ${action === "create" ? "creating" : "updating"} invoice data:`,
        error
      );
      return NextResponse.json(
        { error: `Failed to ${action} invoice data` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Invoice data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid invoice data", details: error.errors },
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
