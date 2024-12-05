"use client";

import ParticipantBaseDashboardForm from "@/app/dashboard/dashboard-forms/participant-base-dashboard-form";
import useSWR from "swr";
import { ApiParticipantBaseType } from "@/schemas/usersSchemas";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UserDataFetch({ user_id }: { user_id: string }) {
  const {
    data: participantBaseData,
    error,
    isLoading,
  } = useSWR<ApiParticipantBaseType>(
    `/api/participants/userId/${user_id}/basic`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load participants data</div>;
  if (!participantBaseData) return <div>No participants data available</div>;

  return (
    <ParticipantBaseDashboardForm participantBaseData={participantBaseData} />
  );
}
