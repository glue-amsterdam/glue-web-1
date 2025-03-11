import { type MapInfo, type Route } from "@/app/hooks/useMapData";
import { SupabaseClient } from "@supabase/supabase-js";

// Utility type to handle both single item and array
type MaybeArray<T> = T | T[];

// Utility function to ensure we always work with arrays
function ensureArray<T>(data: MaybeArray<T>): T[] {
  return Array.isArray(data) ? data : [data];
}

interface UserInfo {
  user_id: string;
  user_name: string;
}

interface MapInfoRaw {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  user_id: string;
  user_info: MaybeArray<UserInfo>;
}

interface ParticipantDetail {
  user_id: string;
  status: string;
  special_program: boolean;
}
interface HubParticipant {
  user_id: string;
  user_info: MaybeArray<UserInfo>;
}

interface HubInfo {
  id: string;
  name: string;
  description: string | null;
  hub_host_id: string;
  hub_participants: MaybeArray<HubParticipant>;
}

interface RouteDot {
  id: string;
  route_id: string;
  map_info_id: string;
  route_step: number;
  user_id: string;
  hub_id: string | null;
  map_info: {
    id: string;
    latitude: number;
    longitude: number;
    formatted_address: string;
  }[];
  user_info: {
    user_name: string;
  }[];
  hubs:
    | {
        name: string;
      }[]
    | null;
}

async function fetchMapInfo(supabase: SupabaseClient): Promise<MapInfo[]> {
  // Fetch all required data in parallel
  const [mapInfoResult, participantResult, hubsResult] = await Promise.all([
    supabase.from("map_info").select(`
        id,
        formatted_address,
        latitude,
        longitude,
        user_id,
        user_info:user_id (
          user_id,
          user_name
        )
      `),
    supabase
      .from("participant_details")
      .select(
        `
        user_id,
        status,
        special_program,
        is_active
      `
      )
      .eq("status", "accepted")
      .eq("is_active", true),
    supabase.from("hubs").select(`
        id,
        name,
        description,
        hub_host_id,
        hub_participants (
          user_id,
          user_info:user_id (
            user_name
          )
        )
      `),
  ]);

  if (mapInfoResult.error) throw mapInfoResult.error;
  if (participantResult.error) throw participantResult.error;
  if (hubsResult.error) throw hubsResult.error;

  const mapInfoData = mapInfoResult.data as MapInfoRaw[];
  const participantData = participantResult.data as ParticipantDetail[];
  const hubsData = hubsResult.data as HubInfo[];

  if (!mapInfoData || !participantData) {
    throw new Error("No map info or participant data returned from Supabase");
  }

  // Create a map of accepted participants with their details
  const acceptedParticipants = new Map(
    participantData.map((p) => [p.user_id, p])
  );

  // Process map_info and hub data
  const locationMap = new Map<string, MapInfo>();

  mapInfoData.forEach((item) => {
    const participant = acceptedParticipants.get(item.user_id);
    if (!participant) return; // Skip if not an accepted participant

    const userInfo = ensureArray(item.user_info)[0];
    if (!userInfo || typeof userInfo.user_name !== "string") {
      console.warn(
        `Missing or invalid user_info for map_info item with id: ${item.id}`
      );
      return;
    }

    locationMap.set(item.id, {
      id: item.id,
      formatted_address: item.formatted_address,
      latitude: item.latitude,
      longitude: item.longitude,
      participants: [
        {
          user_id: userInfo.user_id,
          user_name: userInfo.user_name,
          is_host: true,
        },
      ],
      is_hub: false,
      is_collective: false,
      is_special_program: participant.special_program,
    });
  });

  // Process hubs data
  hubsData.forEach((hub) => {
    const hostMapInfo = mapInfoData.find(
      (info) => info.user_id === hub.hub_host_id
    );
    if (!hostMapInfo) {
      console.warn(
        `No map_info found for hub host with id: ${hub.hub_host_id}`
      );
      return;
    }

    const locationKey = hostMapInfo.id;
    const existingLocation = locationMap.get(locationKey);

    if (existingLocation) {
      const hubParticipants = ensureArray(hub.hub_participants);
      const participantCount = hubParticipants.length;

      existingLocation.is_hub = participantCount > 3;
      existingLocation.is_collective =
        participantCount <= 3 && participantCount > 1;
      existingLocation.hub_name = hub.name;
      existingLocation.hub_description = hub.description;

      // Add hub participants
      hubParticipants.forEach((participant) => {
        const acceptedParticipant = acceptedParticipants.get(
          participant.user_id
        );
        if (participant.user_id !== hub.hub_host_id && acceptedParticipant) {
          const userInfo = ensureArray(participant.user_info)[0];
          if (userInfo && typeof userInfo.user_name === "string") {
            existingLocation.participants.push({
              user_id: participant.user_id,
              user_name: userInfo.user_name,
              is_host: false,
            });
          }
        }
      });
    }
  });

  return Array.from(locationMap.values());
}

async function fetchRoutes(supabase: SupabaseClient): Promise<Route[]> {
  const [routesResult, routeDotsResult] = await Promise.all([
    supabase.from("routes").select(`
        id,
        name,
        description,
        zone,
        user_id
      `),
    supabase
      .from("route_dots")
      .select(
        `
        id,
        route_id,
        map_info_id,
        route_step,
        user_id,
        hub_id,
        map_info (
          id,
          latitude,
          longitude,
          formatted_address
        ),
        user_info (
          user_name
        ),
        hubs (
          name
        )
      `
      )
      .order("route_step"),
  ]);

  if (routesResult.error) throw routesResult.error;
  if (routeDotsResult.error) throw routeDotsResult.error;

  const routesData = routesResult.data as Route[];
  const routeDotsData = routeDotsResult.data as RouteDot[];

  // Transform the data
  const transformedRoutes: Route[] = routesData.map((route) => ({
    ...route,
    dots: routeDotsData
      .filter((dot) => dot.route_id === route.id)
      .map((dot) => {
        const mapInfo = ensureArray(dot.map_info)[0];
        const userName = dot.hub_id
          ? ensureArray(dot.hubs)[0]?.name
          : ensureArray(dot.user_info)[0]?.user_name;

        return {
          id: dot.id,
          route_step: dot.route_step,
          latitude: mapInfo.latitude,
          longitude: mapInfo.longitude,
          formatted_address: mapInfo.formatted_address,
          user_name: userName || "Unknown User", // Provide a default value if userName is undefined
        };
      })
      .sort((a, b) => a.route_step - b.route_step),
  }));

  return transformedRoutes;
}

export async function getServerSideData(supabase: SupabaseClient) {
  try {
    const [mapInfo, routes] = await Promise.all([
      fetchMapInfo(supabase),
      fetchRoutes(supabase),
    ]);

    return { mapInfo, routes };
  } catch (error) {
    console.error("Error fetching server-side data:", error);
    throw error;
  }
}
