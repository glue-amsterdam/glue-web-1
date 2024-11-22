import { mapInfo } from "@/lib/mockMapboxPlaces";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  if (!params || !params.id) {
    return NextResponse.json(
      { message: "Map ID is required" },
      { status: 400 }
    );
  }

  const { id } = params;

  const filteredMap = mapInfo.filter((map) => map.id === id);

  if (filteredMap.length === 0) {
    return NextResponse.json({ message: "Map not found" }, { status: 404 });
  }

  return NextResponse.json({
    user_id: filteredMap[0].userId,
    place_name: filteredMap[0].place_name,
    mapbox_id: filteredMap[0].id,
  });
}
