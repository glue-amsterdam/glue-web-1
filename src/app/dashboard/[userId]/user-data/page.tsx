"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { UserInfoForm } from "@/app/dashboard/[userId]/user-data/user-info-form";
import { UserInfo } from "@/schemas/userInfoSchemas";
import { motion } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function UserDataPage() {
  const { isMod, targetUserId } = useDashboardContext();
  const {
    data: userInfo,
    error,
    isLoading,
  } = useSWR<UserInfo>(`/api/users/participants/${targetUserId}/info`, fetcher);

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load User Info data</div>;
  if (!userInfo) return <div>No User Info data available</div>;
  return (
    <motion.div className="bg-black pt-4 flex-grow">
      <UserInfoForm
        userInfo={userInfo}
        isMod={isMod || false}
        targetUserId={targetUserId}
      />
    </motion.div>
  );
}
