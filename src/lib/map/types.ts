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
  /** user_id of the hub host; used to resolve multi-hub member selection. */
  hubHostUserId?: string;
  memberCount: number;
  members?: MapLocationDetailMember[];
  /** map_info id to focus when this list row is selected (if different from `id`). */
  mapSelectionId?: string;
  /** user_id of hub member when this row represents a flat member entry. */
  hubMemberUserId?: string;
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
  type?: ExhibitorType;
  displayNumber?: string | null;
  /** map_info id to focus on the map when selecting this member. */
  locationId?: string;
  /** Member's own map_info id when selection should resolve to the hub pin. */
  ownMapInfoId?: string;
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
