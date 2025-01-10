import React, { Suspense } from "react";
import Background from "@/app/components/background";
import { LoadingFallback } from "@/app/components/loading-fallback";
import { NAVBAR_HEIGHT } from "@/constants";
import { MapWrapper } from "@/app/map/map-wrapper";

export const metadata = {
  title: "GLUE - Map",
};

export default function MapPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
        className="relative h-screen"
      >
        <MapWrapper />
        <Background />
      </div>
    </Suspense>
  );
}
