"use client";

import PlanZeroForm from "@/app/admin/forms/plans-zero-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { usePlan } from "@/app/hooks/usePlan";

export default function PlanZeroSection() {
  const { plan, isLoading, isError, mutate } = usePlan("planId-0");

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading plan</div>;
  if (!plan) return <div>Plan not found</div>;

  return <PlanZeroForm plan={plan} mutate={mutate} />;
}
