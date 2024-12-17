"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import CreateRouteClientPage from "@/app/dashboard/[userId]/create-route/create-route-client-page";
import { MapInfoAPICall } from "@/schemas/mapSchema";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
function CreateRoute() {
  const {
    data: mapInfoList,
    error,
    isLoading,
  } = useSWR<MapInfoAPICall[]>("/api/maps", fetcher);

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load map data</div>;

  return (
    <>
      <CreateRouteClientPage mapInfoList={mapInfoList} />
    </>
  );
}

export default CreateRoute;
