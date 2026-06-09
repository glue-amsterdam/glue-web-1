import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { loadMapPageData } from "@/lib/map/fetch-map-data";
import { mapMetadata } from "@/lib/metadata";
import { buildMapPageJsonLd } from "@/lib/seo/build-json-ld";
import MapSeoFallback from "@/components/map/map-seo-fallback";
import MapClientPage from "./map-client-page";
import MainContainer from "@/components/main-container";

export const metadata: Metadata = mapMetadata;

const MapPage = async () => {
  const supabase = await createClient();
  const { initialData } = await loadMapPageData(supabase);
  const structuredData = buildMapPageJsonLd(initialData.locations);

  return (
    <div
      className="min-h-dvh pt-(--nav-secondary-h) overflow-x-hidden"
      data-page-container
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MainContainer>
        <MapSeoFallback initialData={initialData} />
        <MapClientPage initialData={initialData} />
      </MainContainer>
    </div>
  );
};

export default MapPage;
