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
import { use } from "react";
import { fetchPlans } from "@/utils/api";
import { PlanType } from "@/utils/sign-in.types";

interface PlanSelectorProps {
  attemptedNextStep: boolean;
}

export default function PlanSelector({ attemptedNextStep }: PlanSelectorProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const selectedPlan = watch("plan");
  const plans = use(fetchPlans());
  const plansArray: PlanType[] = plans.plans;

  const handleSelectPlan = (plan: PlanType) => {
    setValue("plan", plan.planId);
    setValue("planType", plan.planType);
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
          {plansArray.map((plan) => (
            <Card
              key={plan.planId}
              className={`w-[350px] flex-shrink-0 cursor-pointer ${
                selectedPlan === plan.planId ? "border-primary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-wider">
                  {plan.planLabel}
                </CardTitle>
                <CardDescription>
                  {plan.currencyLogo}
                  {plan.planPrice}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[40vh] overflow-y-auto scrollbar-visible">
                  <p className="mb-2 text-sm">{plan.planDescription}</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {plan.planItems.map((feature) => (
                      <li key={feature.id}>{feature.label}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={selectedPlan === plan.planId ? "default" : "outline"}
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
