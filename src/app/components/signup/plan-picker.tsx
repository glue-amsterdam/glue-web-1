"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlansArrayType } from "@/schemas/plansSchema";

// Define the schema for the plan
const planSchema = z.object({
  plan_id: z.string(),
  plan_type: z.enum(["free", "member", "participant"]),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanPickerProps {
  plansData: PlansArrayType;
  onPlanSelected: (data: PlanFormData) => void;
}

export default function PlanPicker({
  plansData,
  onPlanSelected,
}: PlanPickerProps) {
  const { control, handleSubmit, watch, setValue } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      plan_id: "planId-0",
      plan_type: "free",
    },
  });

  const selectedPlan = watch("plan_id");

  const onSubmit = (data: PlanFormData) => {
    onPlanSelected(data);
  };

  const getPlanType = (planId: string): "free" | "member" | "participant" => {
    if (planId === "planId-0") return "free";
    if (planId === "planId-1") return "member";
    return "participant";
  };

  console.log("Selected plan:", selectedPlan);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Select a Plan</h2>
      <div className="flex-grow overflow-x-auto scrollbar-visible">
        <div className="flex space-x-4 pb-4">
          <Controller
            name="plan_id"
            control={control}
            render={({ field }) => (
              <>
                {plansData.plans.map((plan) => (
                  <Card
                    key={plan.plan_id}
                    className={`w-[350px] flex-shrink-0 cursor-pointer ${
                      selectedPlan === plan.plan_id ? "border-primary" : ""
                    }`}
                    onClick={() => {
                      field.onChange(plan.plan_id);
                      setValue("plan_type", getPlanType(plan.plan_id));
                    }}
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
                        type="button"
                        variant={
                          selectedPlan === plan.plan_id ? "default" : "outline"
                        }
                        className="w-full"
                      >
                        {selectedPlan === plan.plan_id
                          ? "Selected"
                          : "Select plan"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Continue with Selected Plan
      </Button>
    </form>
  );
}
