import React from "react";

import { MapPin } from "lucide-react";
import { fetchMapById } from "@/utils/api";
import { dotToHyphen } from "@/constants";

interface MapInfoProps {
  mapId: string;
}

export async function MapInfo({ mapId }: MapInfoProps) {
  const mapQuery = dotToHyphen(mapId);
  const fetchMap = await fetchMapById(mapQuery);

  return (
    <dl className="flex gap-2">
      <MapPin className="h-4 w-4" />
      <dd>{fetchMap.place_name}</dd>
    </dl>
  );
}
