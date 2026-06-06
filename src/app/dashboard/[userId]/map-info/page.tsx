"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import { MapInfoForm } from "@/app/dashboard/[userId]/map-info/map-info-form";
import { MapInfo } from "@/schemas/mapInfoSchemas";
import useSWR from "swr";
import { useParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MapInfoPage() {
  const params = useParams();
  const targetUserId = params.userId as string;
  const {
    data: mapInfo,
    error,
    isLoading,
  } = useSWR<MapInfo | { error: string }>(
    `/api/users/participants/${targetUserId}/map-info`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load map data</div>;
  if (!targetUserId) return <div>No target user ID</div>;

  return <MapInfoForm initialData={mapInfo} targetUserId={targetUserId} />;
}
