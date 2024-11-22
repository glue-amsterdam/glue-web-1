import { fetchMapById } from "@/utils/api";
import MapInfoClient from "./map-info-client";

interface MapInfoServerProps {
  mapId: string;
}

export default async function MapInfoServer({ mapId }: MapInfoServerProps) {
  const mapData = await fetchMapById(mapId);
  return (
    <MapInfoClient placeName={mapData.place_name} mapId={mapData.mapbox_id} />
  );
}
