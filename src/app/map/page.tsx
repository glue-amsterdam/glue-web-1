export const dynamic = "force-dynamic";

import { getServerSideData } from "@/app/map/server-data-fetcher";
import { createClient } from "@/utils/supabase/server";
import MapClientPage from "./map-client-page";

export default async function MapPage() {
  const supabase = await createClient();
  const initialData = await getServerSideData(supabase);

  return <MapClientPage initialData={initialData} />;
}
