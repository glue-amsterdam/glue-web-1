import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { loadMapPageData } from "@/lib/map/fetch-map-data";
import { mapMetadata } from "@/lib/metadata";
import MapClientPage from "./map-client-page";
import MainContainer from "@/components/main-container";

export const metadata: Metadata = mapMetadata;

const MapPage = async () => {
  const supabase = await createClient();
  const { initialData } = await loadMapPageData(supabase);

  return (
    <div
      className="min-h-dvh pt-(--nav-secondary-h) overflow-x-hidden"
      data-page-container
    >
      <MainContainer>
        <MapClientPage initialData={initialData} />
      </MainContainer>
    </div>
  );
};

export default MapPage;
