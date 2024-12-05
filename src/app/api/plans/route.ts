import { PlanSchema } from "@/schemas/plansSchema";
import { createClient } from "@/utils/supabase/server";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .order("plan_id");

    if (error) {
      console.error("Error fetching plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: 500 }
      );
    }

    // Validate the data
    const validatedPlans = plans
      .map((plan) => {
        try {
          return PlanSchema.parse(plan);
        } catch (validationError) {
          console.error(
            "Validation error for plan:",
            plan.plan_id,
            validationError
          );
          return null;
        }
      })
      .filter(Boolean); // Remove any null values from failed validations

    return NextResponse.json({ plans: validatedPlans });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
