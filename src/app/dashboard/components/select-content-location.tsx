"use client";

import { useEffect, useState } from "react";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { fetchMapsIdandName } from "@/utils/api";
import { MapLocationEnhaced } from "@/schemas/mapSchema";

export function SelectContentLocation() {
  const [mapLocations, setMapLocations] = useState<MapLocationEnhaced[]>([]);

  useEffect(() => {
    async function loadMapLocations() {
      const locations = await fetchMapsIdandName();
      setTimeout(() => setMapLocations(locations), 1000); // Simulate loading
    }
    loadMapLocations();
  }, []);

  return (
    <SelectContent className="dashboard-input ">
      {mapLocations.map((location) => (
        <SelectItem key={location.mapbox_id} value={location.mapbox_id}>
          {location.place_name} - (id:{location.user_id})
        </SelectItem>
      ))}
    </SelectContent>
  );
}
