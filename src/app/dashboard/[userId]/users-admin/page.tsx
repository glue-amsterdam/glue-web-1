"use client";

import { useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { UserInfo } from "@/schemas/userInfoSchemas";
import useSWR from "swr";
import UsersAdminPage from "@/app/dashboard/[userId]/users-admin/admin-panel-content";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPanelCall() {
  const { isMod } = useDashboardContext();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    data: users,
    error,
    isLoading,
  } = useSWR<UserInfo[]>(`/api/users/list`, fetcher);

  const {
    data: selectedUserDetails,
    error: detailsError,
    isLoading: isLoadingDetails,
  } = useSWR(selectedUserId ? `/api/users/${selectedUserId}` : null, fetcher);

  if (!isMod) return null;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load user data</div>;

  return (
    <UsersAdminPage
      users={users || []}
      selectedUserDetails={selectedUserDetails}
      isLoadingDetails={isLoadingDetails}
      detailsError={detailsError}
      onSelectUser={setSelectedUserId}
    />
  );
}
