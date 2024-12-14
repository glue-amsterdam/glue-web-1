"use client";

import { useDashboardContext } from "@/app/context/DashboardContext";
import { ProfileImageForm } from "./profile-image-form";
import useSWR from "swr";

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

  if (isLoading || planIdLoading) return <div>Loading...</div>;
  if (error || planIdError) return <div>Failed to load profile images</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Images</h1>
      <ProfileImageForm
        targetUserId={targetUserId as string}
        initialImages={profileImages?.images || []}
        planId={planId?.plan_id}
      />
    </div>
  );
}
