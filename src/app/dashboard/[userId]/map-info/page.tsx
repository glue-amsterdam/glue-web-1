"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { MapInfoForm } from "@/app/dashboard/[userId]/map-info/map-info-form";
import { MapInfo } from "@/schemas/mapInfoSchemas";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ParticipantDetailsPage() {
  const { targetUserId } = useDashboardContext();
  const {
    data: mapInfo,
    error,
    isLoading,
  } = useSWR<MapInfo | { error: string }>(
    `/api/users/participants/${targetUserId}/map-info`,
    fetcher
  );

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load map data</div>;
  if (!targetUserId) return <div>No target user ID</div>;

  return (
    <div className="bg-black pt-4 flex-grow">
      <MapInfoForm initialData={mapInfo} targetUserId={targetUserId} />
    </div>
  );
}
