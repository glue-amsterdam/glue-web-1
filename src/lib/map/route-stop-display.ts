import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { MapLocation, MapRoute } from "@/lib/map/types";
import {
  exhibitorTypeBackgroundCss,
  exhibitorTypeForegroundHex,
} from "@/lib/participants/exhibitor-type-styles";

export type RouteStopDisplay = {
  dotId: string;
  mapInfoId: string;
  routeStep: number;
  participantType: ExhibitorType | null;
  longitude: number;
  latitude: number;
  label: string;
  backgroundColor: string;
  color: string;
  userName: string;
  addressLine: string;
};

const ROUTE_STOP_BACKGROUND = "#ef4444";
const ROUTE_STOP_FOREGROUND = "#ffffff";

export const getRouteStopsForDisplay = (
  route: MapRoute,
  locations: MapLocation[]
): RouteStopDisplay[] => {
  const locationById = new Map(locations.map((loc) => [loc.id, loc]));

  return [...route.dots]
    .sort((a, b) => a.routeStep - b.routeStep)
    .map((dot) => {
      const location = locationById.get(dot.mapInfoId) ?? null;
      const participantType = location?.type ?? null;

      let backgroundColor: string;
      let color: string;

      if (participantType) {
        backgroundColor = exhibitorTypeBackgroundCss(participantType);
        color = exhibitorTypeForegroundHex[participantType];
      } else {
        backgroundColor = ROUTE_STOP_BACKGROUND;
        color = ROUTE_STOP_FOREGROUND;
      }

      return {
        dotId: dot.id,
        mapInfoId: dot.mapInfoId,
        routeStep: dot.routeStep,
        participantType,
        longitude: dot.longitude,
        latitude: dot.latitude,
        label: String(dot.routeStep),
        backgroundColor,
        color,
        userName: dot.name,
        addressLine: dot.addressLine,
      };
    });
};
