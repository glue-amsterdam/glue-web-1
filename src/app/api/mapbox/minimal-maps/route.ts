import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface MapInfoRaw {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  user_info: {
    user_id: string;
    user_name: string;
  };
}

interface HubParticipant {
  user_id: string;
  user_info: {
    user_name: string;
  };
}

interface HubInfo {
  id: string;
  name: string;
  description: string | null;
  hub_host_id: string;
  hub_participants: HubParticipant[];
}

interface MapInfoTransformed {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  participants: {
    user_id: string;
    user_name: string;
    is_host: boolean;
  }[];
  is_hub: boolean;
  hub_name?: string;
  hub_description?: string | null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch map_info data
    const { data: mapInfoData, error: mapInfoError } = (await supabase.from(
      "map_info"
    ).select(`
        id,
        formatted_address,
        latitude,
        longitude,
        user_info:user_id (
          user_id,
          user_name
        )
      `)) as { data: MapInfoRaw[] | null; error: PostgrestError };

    if (mapInfoError) throw mapInfoError;

    // Fetch hubs data
    const { data: hubsData, error: hubsError } = (await supabase.from("hubs")
      .select(`
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
      `)) as { data: HubInfo[] | null; error: PostgrestError };

    if (hubsError) throw hubsError;

    if (!mapInfoData) {
      throw new Error("No map info data returned from Supabase");
    }

    // Create a map to store location data
    const locationMap = new Map<string, MapInfoTransformed>();

    // Process map_info data
    mapInfoData.forEach((item) => {
      if (!item.user_info || typeof item.user_info.user_name !== "string") {
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
            user_id: item.user_info.user_id,
            user_name: item.user_info.user_name,
            is_host: true,
          },
        ],
        is_hub: false,
      });
    });

    // Process hubs data if it exists
    if (hubsData) {
      hubsData.forEach((hub) => {
        const hostMapInfo = mapInfoData.find(
          (info) => info.user_info.user_id === hub.hub_host_id
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
          existingLocation.is_hub = true;
          existingLocation.hub_name = hub.name;
          existingLocation.hub_description = hub.description;

          // Add hub participants
          hub.hub_participants.forEach((participant) => {
            if (participant.user_id !== hub.hub_host_id) {
              existingLocation.participants.push({
                user_id: participant.user_id,
                user_name: participant.user_info.user_name,
                is_host: false,
              });
            }
          });
        }
      });
    } else {
      console.warn("No hub data returned from Supabase");
    }

    const transformedData = Array.from(locationMap.values());

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching map and hub information:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
