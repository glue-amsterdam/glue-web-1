"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import type { PlanType } from "@/schemas/plansSchema";

type PlanSettingsFieldsProps = {
  plans: PlanType[];
  readOnly?: boolean;
};

export const PlanSettingsFields = ({
  plans,
  readOnly = false,
}: PlanSettingsFieldsProps) => {
  const { control, setValue, watch } = useFormContext<ParticipantDetails>();
  const currentPlanId = watch("plan_id");

  return (
    <div className="mini-padding space-y-[15px]">
      <FormField
        control={control}
        name="plan_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan</FormLabel>
            <Select
              disabled={readOnly}
              value={field.value ?? undefined}
              onValueChange={(value) => {
                const selectedPlan = plans.find((plan) => plan.plan_id === value);
                field.onChange(value);
                if (selectedPlan) {
                  setValue("plan_type", selectedPlan.plan_type, {
                    shouldDirty: true,
                  });
                }
              }}
            >
              <FormControl>
                <SelectTrigger className="bg-(--white-color) text-(--black-color) disabled:opacity-60">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.plan_id} value={plan.plan_id}>
                    {plan.plan_label}
                  </SelectItem>
                ))}
                {currentPlanId &&
                  !plans.some((plan) => plan.plan_id === currentPlanId) && (
                    <SelectItem value={currentPlanId}>Unknown plan</SelectItem>
                  )}
              </SelectContent>
            </Select>
            <FormMessage />
            {currentPlanId &&
              !plans.some((plan) => plan.plan_id === currentPlanId) && (
                <p className="text-red-500 text-xs mt-2">
                  The user&apos;s current plan is not in the list of available
                  plans. Please select a different plan.
                </p>
              )}
          </FormItem>
        )}
      />
    </div>
  );
};
