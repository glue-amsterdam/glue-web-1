"use client";

import PlanPayedForm from "@/app/admin/forms/plans-payed-forms";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { usePlan } from "@/app/hooks/usePlan";

export default function PlanFourSection() {
  const { plan, isLoading, isError, mutate } = usePlan("planId-4");

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading plan</div>;
  if (!plan) return <div>Plan not found</div>;

  return <PlanPayedForm plan={plan} mutate={mutate} />;
}
