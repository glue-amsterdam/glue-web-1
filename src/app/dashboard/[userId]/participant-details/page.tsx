"use client";

import { useDashboardContext } from "@/app/context/DashboardContext";
import { ParticipantDetailsForm } from "@/app/dashboard/[userId]/participant-details/participant-details-form";
import { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import useSWR from "swr";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function ParticipantDetailsPage() {
  const { isMod, targetUserId } = useDashboardContext();
  const {
    data: participantDetails,
    error,
    isLoading,
  } = useSWR<ParticipantDetails>(
    `/api/users/participants/${targetUserId}/details`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load participant details data</div>;
  if (!participantDetails)
    return <div>No participant details data available</div>;
  return (
    <ParticipantDetailsForm
      participantDetails={participantDetails}
      isMod={isMod || false}
      targetUserId={targetUserId}
    />
  );
}
