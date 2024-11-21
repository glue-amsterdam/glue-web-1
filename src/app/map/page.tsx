import React /*  Suspense */ from "react";
/* import { fetchLocationGroups } from "@/utils/api";
import MapMain from "@/app/components/map/map-main"; */
import { Metadata } from "next";
import Background from "@/app/components/background";

export const metadata: Metadata = {
  title: "GLUE - Map",
};

async function MapPage() {
  /*   const locationGroups = await fetchLocationGroups(); */

  return (
    <>
      <div className={`main-container mx-auto px-4 py-8 z-10`}>
        {/* <Suspense>
          <MapMain locationGroups={locationGroups} />
        </Suspense> */}
      </div>
      <Background />
    </>
  );
}

export default MapPage;
