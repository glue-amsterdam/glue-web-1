import React, { Suspense } from "react";
import { fetchLocationGroups } from "@/utils/api";
import MapMain from "../components/map/map-main";
import { Metadata } from "next";
import Background from "../components/background";

export const metadata: Metadata = {
  title: "GLUE - Map",
};

async function MapPage() {
  const locationGroups = await fetchLocationGroups();

  return (
    <div className="fixed inset-0 ">
      <main className="container relative mx-auto px-4 py-8 z-10">
        <Suspense>
          <MapMain locationGroups={locationGroups} />
        </Suspense>
      </main>
      <Background />
    </div>
  );
}

export default MapPage;
