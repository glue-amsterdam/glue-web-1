export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import Background from "@/app/components/background";
import { LoadingFallback } from "@/app/components/loading-fallback";
import { NAVBAR_HEIGHT } from "@/constants";
import { getServerSideData } from "@/app/map/server-data-fetcher";
import { config } from "@/env";
import { createClient } from "@/utils/supabase/server";
import MapWrapper from "@/app/map/map-wrapper";

export const metadata = {
  title: `GLUE - ${config.cityName} Map`,
};

export default async function MapPage() {
  const supabase = await createClient();
  const initialData = await getServerSideData(supabase);

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
