"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { z } from "zod";
import { motion } from "framer-motion";
import useSWR from "swr";
import { UserInfoForm } from "@/app/dashboard/[userId]/user-data/user-info-form";
import { userInfoSchema } from "@/schemas/userInfoSchemas";
import { PlanType } from "@/schemas/plansSchema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserDataPage() {
  const { isMod, targetUserId } = useDashboardContext();
  const {
    data: userInfo,
    error: userError,
    isLoading: userLoading,
  } = useSWR<z.infer<typeof userInfoSchema>>(
    `/api/users/participants/${targetUserId}/info`,
    fetcher
  );

  const {
    data: plansData,
    error: plansError,
    isLoading: plansLoading,
  } = useSWR("/api/plans", fetcher);

  if (userLoading || plansLoading) return <LoadingFallbackMini />;
  if (userError) return <div>Failed to load User Info data</div>;
  if (plansError) return <div>Failed to load Plans data</div>;
  if (!userInfo || !plansData) return <div>No data available</div>;

  const plans: PlanType[] = plansData.plans;

  return (
    <motion.div className="bg-black pt-4 flex-grow">
      <UserInfoForm
        userInfo={userInfo}
        isMod={isMod || false}
        targetUserId={targetUserId as string}
        plans={plans}
      />
    </motion.div>
  );
}
