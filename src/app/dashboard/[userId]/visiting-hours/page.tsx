"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { VisitingHoursForm } from "@/app/dashboard/[userId]/visiting-hours/visiting-hours-form";
import { VisitingHoursDays } from "@/schemas/visitingHoursSchema";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function VisitingHoursPage() {
  const { targetUserId } = useDashboardContext();
  const {
    data: visitingHours,
    error,
    isLoading,
  } = useSWR<VisitingHoursDays[]>(
    `/api/users/participants/${targetUserId}/hours`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load visiting hours data</div>;
  if (!visitingHours) return <div>No visiting hours data available</div>;
  return (
    <VisitingHoursForm
      initialData={visitingHours}
      targetUserId={targetUserId}
    />
  );
}
