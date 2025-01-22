"use client";

import { usePlan } from "@/app/hooks/usePlan";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import PlanZeroForm from "@/app/admin/forms/plans-zero-form";
import PlanPayedForm from "@/app/admin/forms/plans-payed-forms";
import type { PlanType } from "@/schemas/plansSchema";

interface PlanSectionProps {
  planId: string;
}

export default function PlanSection({ planId }: PlanSectionProps) {
  const { plan, isLoading, isError, mutate } = usePlan(planId);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading plan</div>;
  if (!plan) return <div>Plan not found</div>;

  const PlanForm = planId === "planId-0" ? PlanZeroForm : PlanPayedForm;

  return <PlanForm plan={plan as PlanType} mutate={mutate} />;
}
