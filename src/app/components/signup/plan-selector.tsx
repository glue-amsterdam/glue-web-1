"use client";

import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlansArrayType, PlanType } from "@/schemas/plansSchema";

interface PlanSelectorProps {
  attemptedNextStep: boolean;
  plansData: PlansArrayType;
}

export default function SignInPlanSelector({
  attemptedNextStep,
  plansData,
}: PlanSelectorProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const selectedPlan = watch("plan");
  const plansArray: PlansArrayType = plansData;

  const handleSelectPlan = (plan: PlanType) => {
    setValue("plan", plan.plan_id);
    setValue("planType", plan.plan_type);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <h2 className="text-2xl font-bold text-white">Select a Plan</h2>
      {attemptedNextStep && errors.plan && (
        <p className="text-red-500 mt-2 text-sm" role="alert">
          Please select a plan to continue
        </p>
      )}
      <div className="flex-grow overflow-x-auto scrollbar-visible">
        <div className="flex space-x-4 pb-4">
          {plansArray.plans.map((plan) => (
            <Card
              key={plan.plan_id}
              className={`w-[350px] flex-shrink-0 cursor-pointer ${
                selectedPlan === plan.plan_id ? "border-primary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-wider">
                  {plan.plan_label}
                </CardTitle>
                <CardDescription>
                  {plan.currency_logo}
                  {plan.plan_price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[40vh] overflow-y-auto scrollbar-visible">
                  <p className="mb-2 text-sm">{plan.plan_description}</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {plan.plan_items.map((feature, index) => (
                      <li key={feature.label + index}>{feature.label}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={
                    selectedPlan === plan.plan_id ? "default" : "outline"
                  }
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                >
                  Select Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
