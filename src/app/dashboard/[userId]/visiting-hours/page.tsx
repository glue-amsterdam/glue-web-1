"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { VisitingHoursForm } from "@/app/dashboard/[userId]/visiting-hours/visiting-hours-form";
import { VisitingHours } from "@/schemas/visitingHoursSchema";
import { motion } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function VisitingHoursPage() {
  const { targetUserId } = useDashboardContext();
  const {
    data: visitingHours,
    error,
    isLoading,
  } = useSWR<VisitingHours>(
    `/api/users/participants/${targetUserId}/hours`,
    fetcher
  );

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load visiting hours data</div>;
  if (!visitingHours) return <div>No visiting hours data available</div>;
  return (
    <motion.div className="bg-black pt-4 flex-grow">
      <VisitingHoursForm
        initialData={visitingHours}
        targetUserId={targetUserId}
      />
    </motion.div>
  );
}
