import type { ExhibitorType } from "@/lib/participants/exhibitor-types";

export type MapTourMode = "live" | "snapshot";

export type MapLocation = {
  id: string;
  latitude: number;
  longitude: number;
  type: ExhibitorType;
  name: string;
  displayNumber: string | null;
  addressLine: string;
  slug?: string;
  hubId?: string;
  memberCount: number;
  members?: MapLocationDetailMember[];
};

export type MapRouteDot = {
  id: string;
  routeStep: number;
  latitude: number;
  longitude: number;
  addressLine: string;
  name: string;
  mapInfoId: string;
};

export type MapRoute = {
  id: string;
  name: string;
  description: string | null;
  zone: string;
  dots: MapRouteDot[];
};

export type MapPageData = {
  tourMode: MapTourMode;
  locations: MapLocation[];
  routes: MapRoute[];
};

export type MapLocationSnapshot = {
  version: 2;
  capturedAt: string;
  locations: MapLocation[];
};

export type MapLocationDetailMember = {
  name: string;
  slug?: string;
  imageUrl?: string;
  userId?: string;
};

export type MapLocationDetail = {
  imageUrl: string | null;
  description: string | null;
  memberCount: number;
  members?: MapLocationDetailMember[];
  profileHref: string | null;
};

export const MAP_DATA_CACHE_TAG = "map-data";

export type TourStatusRow = {
  current_tour_status: "new" | "older";
  updated_at: string;
  previous_tour_map_info: unknown;
};
