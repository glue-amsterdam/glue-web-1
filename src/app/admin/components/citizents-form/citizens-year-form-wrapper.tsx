"use client";

import { ErrorBoundary } from "react-error-boundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import CitizensYearData from "@/app/admin/components/citizents-form/citizens-year-data";
import { Suspense } from "react";

interface CitizensYearFormWrapperProps {
  selectedYear: string;
  isNewYear: boolean;
}

export function CitizensYearFormWrapper({
  selectedYear,
  isNewYear,
}: CitizensYearFormWrapperProps) {
  return (
    <ErrorBoundary
      fallback={<div>Error loading citizens data. Please try again.</div>}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <CitizensYearData selectedYear={selectedYear} isNewYear={isNewYear} />
      </Suspense>
    </ErrorBoundary>
  );
}
