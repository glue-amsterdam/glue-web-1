import { users } from "@/lib/mockMembers";
import plans from "@/lib/mockPlans";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  const user = users.find((user) => user.userId === params.id);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const plan = plans.plans.find((plan) => plan.planId === user.planId);

  if (!plan) {
    return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  }

  const planSummary = {
    planLabel: plan.planLabel,
    planPrice: plan.planPrice,
    planCurrency: plan.planCurrency,
    currencyLogo: plan.currencyLogo,
  };

  const userWithPlanDetails: UserWithPlanDetails = {
    ...user,
    planDetails: planSummary,
  };

  return NextResponse.json(userWithPlanDetails);
}
