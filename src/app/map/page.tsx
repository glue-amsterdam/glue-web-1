import Background from "@/app/components/background";
import { LoadingFallback } from "@/app/components/loading-fallback";
import MapMain from "@/app/map/map-main";
import { NAVBAR_HEIGHT } from "@/constants";
import React, { Suspense } from "react";

export const metadata = {
  title: "GLUE - Map",
};

export default function MapPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}>
        <MapMain />
        <Background />
      </div>
    </Suspense>
  );
}
