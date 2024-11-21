import { mapInfo } from "@/lib/mockMapboxPlaces";
import { MapLocationEnhaced } from "@/schemas/mapSchema";
import { NextResponse } from "next/server";

export async function GET() {
  const mapLocations = mapInfo;

  const response: MapLocationEnhaced[] = mapLocations.map((location) => {
    return {
      mapbox_id: location.id,
      place_name: location.place_name,
      user_id: location.userId,
    };
  });

  return NextResponse.json(response);
}
