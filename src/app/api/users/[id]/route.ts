import { users } from "@/lib/mockMembers";
import { PlanSchema } from "@/schemas/plansSchema";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  if (!params?.id) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }
  try {
    const user = users.find((user) => user.user_id === params.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const supabase = await createClient();

    const { data: plan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("plan_id", user.plan_id);

    if (error) {
      console.error("Error fetching plan:", error);
      return NextResponse.json(
        { error: "Failed to fetch plan" },
        { status: 500 }
      );
    }

    if (!plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const validatePlan = PlanSchema.parse(plan);

    const planSummary = {
      plan_label: validatePlan.plan_label,
      plan_price: validatePlan.plan_price,
      plan_currency: validatePlan.plan_currency,
      currency_logo: validatePlan.currency_logo,
    };

    const userWithPlanDetails: UserWithPlanDetails = {
      ...user,
      planDetails: planSummary,
    };

    return NextResponse.json(userWithPlanDetails);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
