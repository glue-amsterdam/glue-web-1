import { hyphenToDot } from "@/constants";
import { mapInfo } from "@/lib/mockMapboxPlaces";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params || !params.id) {
    return NextResponse.json(
      { message: "Map ID is required" },
      { status: 400 }
    );
  }

  const { id } = params;
  const transformedId = hyphenToDot(id);

  const filteredMap = mapInfo.filter((map) => map.id === transformedId);

  if (filteredMap.length === 0) {
    return NextResponse.json({ message: "Map not found" }, { status: 404 });
  }

  return NextResponse.json({
    user_id: filteredMap[0].userId,
    place_name: filteredMap[0].place_name,
    mapbox_id: filteredMap[0].id,
  });
}
