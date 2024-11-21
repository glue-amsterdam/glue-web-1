import { dotToHyphen } from "@/constants";
import { fetchMapById } from "@/utils/api";
import { useState, use } from "react";

export function useMapInfo(mapId: string) {
  const [error] = useState<Error | null>(null);
  const mapQuery = dotToHyphen(mapId);
  console.log("mapQuery:", mapQuery);

  const fetchMap = use(fetchMapById(mapQuery));

  console.log("mapInfo:", fetchMap);

  if (error) {
    throw error;
  }

  if (!fetchMap) {
    throw new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return fetchMap;
}
