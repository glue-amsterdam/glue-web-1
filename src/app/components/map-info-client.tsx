"use client";

import { MapPin } from "lucide-react";

interface MapInfoClientProps {
  placeName: string;
  mapId: string;
}

export default function MapInfoClient({
  placeName,
  mapId,
}: MapInfoClientProps) {
  return (
    <a
      target="_blank"
      href={`/map/${mapId}`}
      className="flex items-center gap-2"
    >
      <MapPin className="h-4 w-4" />
      <dd>{placeName}</dd>
    </a>
  );
}
