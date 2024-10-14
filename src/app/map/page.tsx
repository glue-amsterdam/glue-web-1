import React, { Suspense } from "react";
import BackgroundGrid from "../components/background-grid";
import LogoMain from "../components/home-page/logo-main";
import { fetchLocationGroups } from "@/utils/api";
import MapMain from "../components/map/map-main";

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

function Background() {
  return (
    <div className="fixed inset-0">
      <LogoMain />
      <BackgroundGrid />
    </div>
  );
}

export default MapPage;
