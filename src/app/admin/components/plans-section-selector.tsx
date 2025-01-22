"use client";

import type { PlanIdType, PlanType } from "@/schemas/plansSchema";
import { useRouter, usePathname } from "next/navigation";

interface PlanSelectorProps {
  currentPlan: PlanIdType;
  plans: PlanType[];
}

export default function PlanSelector({
  currentPlan,
  plans,
}: PlanSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePlanChange = (planId: string) => {
    router.push(`${pathname}?plan=${planId}`);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="plan-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select Plan:
      </label>
      <select
        id="plan-selector"
        value={currentPlan}
        onChange={(e) => handlePlanChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {plans.map((plan) => (
          <option key={plan.plan_id} value={plan.plan_id}>
            {plan.plan_label}
          </option>
        ))}
      </select>
    </div>
  );
}
