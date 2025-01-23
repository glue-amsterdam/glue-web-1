import React, { Suspense } from "react";
import Background from "@/app/components/background";
import { LoadingFallback } from "@/app/components/loading-fallback";
import { NAVBAR_HEIGHT } from "@/constants";
import { MapWrapper } from "@/app/map/map-wrapper";
import { getServerSideData } from "@/app/map/server-data-fetcher";
import { config } from "@/env";

export const metadata = {
  title: `GLUE - ${config.cityName} Map`,
};

export default async function MapPage() {
  const initialData = await getServerSideData();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
        className="relative h-screen"
      >
        <MapWrapper initialData={initialData} />
        <Background />
      </div>
    </Suspense>
  );
}
