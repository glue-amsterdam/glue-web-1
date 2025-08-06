"use client";

import { useDashboardContext } from "@/app/context/DashboardContext";
import { ProfileImageForm } from "./profile-image-form";
import useSWR from "swr";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfileImagePage() {
  const { targetUserId } = useDashboardContext();
  const {
    data: profileImages,
    error,
    isLoading,
  } = useSWR(`/api/users/participants/${targetUserId}/profile-image`, fetcher);

  const {
    data: planId,
    error: planIdError,
    isLoading: planIdLoading,
  } = useSWR(`/api/users/participants/${targetUserId}/plan-id`, fetcher);

  if (isLoading || planIdLoading) return <LoadingSpinner />;
  if (error || planIdError) return <div>Failed to load profile images</div>;

  return (
    <div className="w-full max-w-[80%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Images</h1>
      <ProfileImageForm
        targetUserId={targetUserId as string}
        initialImages={profileImages?.images || []}
        planId={planId?.plan_id}
      />
    </div>
  );
}
