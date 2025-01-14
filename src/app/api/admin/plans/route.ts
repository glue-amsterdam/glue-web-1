import { PlanSchema } from "@/schemas/plansSchema";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("plan");

  if (!plan) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("plan_id", plan)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const validatedData = PlanSchema.parse(data);
    return NextResponse.json(validatedData);
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return NextResponse.json(
      { error: "Data validation failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  const planData = await request.json();

  try {
    const supabase = await createClient();
    const validatedPlan = PlanSchema.parse(planData);

    const { data, error } = await supabase
      .from("plans")
      .insert(validatedPlan)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return NextResponse.json(
      { error: "Data validation failed" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("plan");

  if (!planId) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
  }

  const updates = await request.json();

  try {
    const supabase = await createClient();
    const validatedUpdates = PlanSchema.partial().parse(updates);

    const { data, error } = await supabase
      .from("plans")
      .update(validatedUpdates)
      .eq("plan_id", planId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const validatedData = PlanSchema.parse(data);
    return NextResponse.json(validatedData);
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return NextResponse.json(
      { error: "Data validation failed" },
      { status: 400 }
    );
  }
}
