import React from "react";
import { useMapInfo } from "../hooks/useMapInfo";
import { MapPin } from "lucide-react";

interface MapInfoProps {
  mapId: string;
}

export function MapInfo({ mapId }: MapInfoProps) {
  const mapInfo = useMapInfo(mapId);

  return (
    <dl className="flex gap-2">
      <MapPin className="h-4 w-4" />
      <dd>{mapInfo.place_name}</dd>
    </dl>
  );
}
