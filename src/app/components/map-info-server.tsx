import { fetchMapById } from "@/utils/api";
import { dotToHyphen } from "@/constants";
import { MapInfoClient } from "@/app/components/map-info-client";

interface MapInfoServerProps {
  mapId: string;
}

export async function MapInfoServer({ mapId }: MapInfoServerProps) {
  const mapQuery = dotToHyphen(mapId);
  const mapData = await fetchMapById(mapQuery);

  return <MapInfoClient placeName={mapData.place_name} mapId={mapQuery} />;
}
