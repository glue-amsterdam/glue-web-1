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

interface ParticipantDetail {
  user_id: string;
  status: string;
  special_program: boolean;
  is_active?: boolean;
  was_active_last_year?: boolean;
  slug: string | null;
  display_number: string | null;
}

interface ParticipantImage {
  user_id: string;
  image_url: string;
}

interface HubParticipant {
  user_id: string;
}

interface HubInfo {
  id: string;
  name: string;
  description: string | null;
  hub_host_id: string;
  display_number: string | null;
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
  hubs:
    | {
        name: string;
      }[]
    | null;
}

interface MapInfoRaw {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  user_id: string;
}

export async function fetchMapInfo(supabase: SupabaseClient): Promise<MapInfo[]> {
  // Fetch tour status first to determine filtering logic
  const { data: tourStatus, error: tourStatusError } = await supabase
    .from("tour_status")
    .select("current_tour_status, previous_tour_map_info")
    .single();

  if (tourStatusError) {
    console.error("Error fetching tour status:", tourStatusError);
    // Default to "new" if tour status fetch fails
  }

  const currentTourStatus = tourStatus?.current_tour_status || "new";
  const previousTourMapInfo = (tourStatus?.previous_tour_map_info as
    | MapInfo[]
    | null) || null;

  // If viewing older tour and snapshot exists, return it directly
  if (currentTourStatus === "older" && previousTourMapInfo && previousTourMapInfo.length > 0) {
    console.log(`Returning map snapshot with ${previousTourMapInfo.length} locations`);
    return previousTourMapInfo;
  }

  // DEBUG: Fetch all participants to see totals
  console.log("=== MAP FILTERING DEBUG ===");
  console.log(`Current tour status: ${currentTourStatus}`);

  if (currentTourStatus === "new") {
    // Debug for "new" tour status
    const { data: allIsActive, error: debugError } = await supabase
      .from("participant_details")
      .select("user_id, status, is_active")
      .eq("is_active", true);

    if (!debugError && allIsActive) {
      console.log(
        `Total participants with is_active=true: ${allIsActive.length}`
      );
      const acceptedIsActive = allIsActive.filter(
        (p) => p.status === "accepted"
      );
      console.log(
        `Participants with is_active=true AND status=accepted: ${acceptedIsActive.length}`
      );
    }
  } else if (currentTourStatus === "older") {
    // Debug for "older" tour status
    const { data: allWasActiveLastYear, error: debugError } = await supabase
      .from("participant_details")
      .select("user_id, status, was_active_last_year")
      .eq("was_active_last_year", true);

    if (!debugError && allWasActiveLastYear) {
      console.log(
        `Total participants with was_active_last_year=true: ${allWasActiveLastYear.length}`
      );
      const acceptedWasActive = allWasActiveLastYear.filter(
        (p) => p.status === "accepted"
      );
      console.log(
        `Participants with was_active_last_year=true AND status=accepted: ${acceptedWasActive.length}`
      );
    }
  }

  // Build participant query based on tour status
  let participantQuery = supabase
    .from("participant_details")
    .select(
      `
        user_id,
        status,
        special_program,
        is_active,
        was_active_last_year,
        slug,
        display_number
      `
    )
    .eq("status", "accepted");

  // Filter by tour status
  // If "new": filter by is_active = true
  // If "older": filter by was_active_last_year = true
  if (currentTourStatus === "new") {
    participantQuery = participantQuery.eq("is_active", true);
  } else if (currentTourStatus === "older") {
    participantQuery = participantQuery.eq("was_active_last_year", true);
  }

  // Fetch current hubs from database (only for "new" tour status)
  const { data: hubsDataRaw, error: hubsError } = await supabase.from("hubs").select(`
      id,
      name,
      description,
      hub_host_id,
      display_number,
      hub_participants (
        user_id
      )
    `);

  if (hubsError) throw hubsError;
  const hubsData = (hubsDataRaw as HubInfo[]) || [];

  // Fetch all other required data in parallel
  const [
    mapInfoResult,
    participantResult,
    participantImagesResult,
  ] = await Promise.all([
    supabase.from("map_info").select(`
        id,
        formatted_address,
        latitude,
        longitude,
        user_id
      `),
    participantQuery,
    supabase
      .from("participant_image")
      .select(
        `
        user_id,
        image_url
      `
      )
      .order("id", { ascending: true }),
  ]);

  if (mapInfoResult.error) throw mapInfoResult.error;
  if (participantResult.error) throw participantResult.error;
  if (participantImagesResult.error) throw participantImagesResult.error;

  const mapInfoData = mapInfoResult.data as MapInfoRaw[];
  const participantData = participantResult.data as ParticipantDetail[];
  const participantImagesData =
    participantImagesResult.data as ParticipantImage[];

  console.log(`Participants after status + tour filter: ${participantData?.length || 0}`);
  console.log(`Map_info entries: ${mapInfoData?.length || 0}`);
  console.log(`Total hubs fetched from database: ${hubsData?.length || 0}`);

  if (!mapInfoData || !participantData) {
    throw new Error("No map info or participant data returned from Supabase");
  }

  // DEBUG: Check how many participants have map_info
  const participantUserIds = new Set(participantData.map((p) => p.user_id));
  const mapInfoUserIds = new Set(mapInfoData.map((m) => m.user_id));
  const participantsWithMapInfo = participantData.filter((p) =>
    mapInfoUserIds.has(p.user_id)
  );
  const participantsWithoutMapInfo = participantData.filter(
    (p) => !mapInfoUserIds.has(p.user_id)
  );

  console.log(`Participants WITH map_info: ${participantsWithMapInfo.length}`);
  console.log(`Participants WITHOUT map_info: ${participantsWithoutMapInfo.length}`);
  if (participantsWithoutMapInfo.length > 0) {
    console.log(
      "Participants without map_info user_ids:",
      participantsWithoutMapInfo.map((p) => p.user_id).slice(0, 10)
    );
  }

  // Fetch user_info separately for all user_ids (avoids ambiguous foreign key relationships)
  const allUserIds = new Set<string>();
  mapInfoData.forEach((item) => allUserIds.add(item.user_id));
  hubsData.forEach((hub) => {
    const hubParticipants = ensureArray(hub.hub_participants);
    hubParticipants.forEach((p) => allUserIds.add(p.user_id));
  });

  // Fetch user_info for all user_ids
  const { data: userInfoData, error: userInfoError } = await supabase
    .from("user_info")
    .select("user_id, user_name")
    .in("user_id", Array.from(allUserIds));

  if (userInfoError) {
    console.error("Error fetching user_info:", userInfoError);
    throw userInfoError;
  }

  // Create user_info lookup map
  const userInfoMap = new Map<string, UserInfo>();
  userInfoData?.forEach((user) => {
    userInfoMap.set(user.user_id, {
      user_id: user.user_id,
      user_name: user.user_name || "",
    });
  });

  // Create lookup maps for efficient data access
  const acceptedParticipants = new Map(
    participantData.map((p) => [p.user_id, p])
  );

  // DEBUG: Check which hubs have hosts that match tour status
  if (hubsData && hubsData.length > 0) {
    const hubHostIds = hubsData.map((h) => h.hub_host_id);
    const matchingHosts = hubHostIds.filter((hostId) =>
      acceptedParticipants.has(hostId)
    );
    console.log(
      `Hubs with hosts matching tour status: ${matchingHosts.length} out of ${hubHostIds.length}`
    );
  }

  // NOTE: There are database triggers (cleanup_inactive_hub_participant and cleanup_inactive_route_participant)
  // that may delete hubs/hub_participants when is_active becomes false.
  // When tour status is "older", participants may have is_active=false but was_active_last_year=true,
  // so we need to ensure we're still showing hubs for those participants.
  // If hubs were deleted by the trigger, we'll only have the hubs that still exist (where host is_active=true).

  // Create image lookup map (keep only the first image per user)
  const imageMap = new Map<string, string>();
  participantImagesData.forEach((image) => {
    if (!imageMap.has(image.user_id)) {
      imageMap.set(image.user_id, image.image_url);
    }
  });

  // Process map_info and hub data
  const locationMap = new Map<string, MapInfo>();
  let skippedNoParticipant = 0;
  let skippedNoUserInfo = 0;
  let addedLocations = 0;

  mapInfoData.forEach((item) => {
    const participant = acceptedParticipants.get(item.user_id);
    if (!participant) {
      skippedNoParticipant++;
      return; // Skip if not an accepted participant
    }

    const userInfo = userInfoMap.get(item.user_id);
    if (!userInfo || typeof userInfo.user_name !== "string") {
      skippedNoUserInfo++;
      console.warn(
        `Missing or invalid user_info for map_info item with id: ${item.id}, user_id: ${item.user_id}`
      );
      return;
    }

    addedLocations++;
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
          slug: participant.slug,
          image_url: imageMap.get(userInfo.user_id) || null,
          display_number: participant.display_number,
        },
      ],
      is_hub: false,
      is_collective: false,
      is_special_program: participant.special_program,
      display_number: participant.display_number,
    });
  });

  // Process hubs data
  let totalHubParticipants = 0;
  let hubParticipantsAdded = 0;
  let hubParticipantsSkipped = 0;
  let hubsSkippedNoHost = 0;

  hubsData.forEach((hub) => {
    // Check if hub host matches the tour status filter
    const hostParticipant = acceptedParticipants.get(hub.hub_host_id);
    if (!hostParticipant) {
      hubsSkippedNoHost++;
      console.log(
        `Hub ${hub.id} (host: ${hub.hub_host_id}) skipped - host not in acceptedParticipants (tour status: ${currentTourStatus})`
      );
      return;
    }

    const hostMapInfo = mapInfoData.find(
      (info) => info.user_id === hub.hub_host_id
    );
    if (!hostMapInfo) {
      console.warn(
        `No map_info found for hub host with id: ${hub.hub_host_id} (hub: ${hub.id})`
      );
      return;
    }

    const locationKey = hostMapInfo.id;
    let existingLocation = locationMap.get(locationKey);

    // If location doesn't exist yet (host wasn't in map_info initially but hub exists),
    // create it now for the hub
    if (!existingLocation) {
      const hostUserInfo = userInfoMap.get(hub.hub_host_id);
      if (hostUserInfo && typeof hostUserInfo.user_name === "string") {
        existingLocation = {
          id: hostMapInfo.id,
          formatted_address: hostMapInfo.formatted_address,
          latitude: hostMapInfo.latitude,
          longitude: hostMapInfo.longitude,
          participants: [
            {
              user_id: hostUserInfo.user_id,
              user_name: hostUserInfo.user_name,
              is_host: true,
              slug: hostParticipant.slug,
              image_url: imageMap.get(hostUserInfo.user_id) || null,
              display_number: hostParticipant.display_number,
            },
          ],
          is_hub: false,
          is_collective: false,
          is_special_program: hostParticipant.special_program,
          display_number: hostParticipant.display_number,
        };
        locationMap.set(locationKey, existingLocation);
        addedLocations++;
      }
    }

    if (existingLocation) {
      const hubParticipants = ensureArray(hub.hub_participants);
      const participantCount = hubParticipants.length;
      totalHubParticipants += participantCount;

      // Keep the original is_hub flag from the database, but also set is_collective
      // is_hub should remain true if it was originally a hub, regardless of participant count
      existingLocation.is_collective =
        !existingLocation.is_hub &&
        participantCount <= 3 &&
        participantCount > 1;
      existingLocation.hub_name = hub.name;
      existingLocation.hub_description = hub.description;
      existingLocation.hub_display_number = hub.display_number;

      // Add hub participants
      // IMPORTANT: We check if hub participants are in acceptedParticipants,
      // which is already filtered by tour status (is_active for "new", was_active_last_year for "older")
      hubParticipants.forEach((participant) => {
        // Skip if this is the host (they're already added as the first participant)
        if (participant.user_id === hub.hub_host_id) {
          return;
        }

        // Check if this participant matches the tour status filter
        const acceptedParticipant = acceptedParticipants.get(
          participant.user_id
        );
        
        if (acceptedParticipant) {
          const userInfo = userInfoMap.get(participant.user_id);
          if (userInfo && typeof userInfo.user_name === "string") {
            hubParticipantsAdded++;
            existingLocation.participants.push({
              user_id: participant.user_id,
              user_name: userInfo.user_name,
              is_host: false,
              slug: acceptedParticipant.slug,
              image_url: imageMap.get(participant.user_id) || null,
              display_number: acceptedParticipant.display_number,
            });
          } else {
            hubParticipantsSkipped++;
            console.warn(
              `Hub participant ${participant.user_id} in hub ${hub.id} has no user_info`
            );
          }
        } else {
          hubParticipantsSkipped++;
          // Debug: log why hub participants are being skipped
          console.log(
            `Hub participant ${participant.user_id} in hub ${hub.id} (host: ${hub.hub_host_id}) skipped - not in acceptedParticipants (tour status: ${currentTourStatus})`
          );
        }
      });
    }
  });

  console.log(`Total hubs processed: ${hubsData.length}`);
  console.log(`Hubs skipped (host not matching tour filter): ${hubsSkippedNoHost}`);
  console.log(`Total hub participants found: ${totalHubParticipants}`);
  console.log(`Hub participants added: ${hubParticipantsAdded}`);
  console.log(`Hub participants skipped (not matching tour filter): ${hubParticipantsSkipped}`);

  console.log(`Locations added to map: ${addedLocations}`);
  console.log(`Map_info entries skipped (no participant): ${skippedNoParticipant}`);
  console.log(`Map_info entries skipped (no user_info): ${skippedNoUserInfo}`);
  console.log(`Final locations on map: ${locationMap.size}`);
  console.log("=== END MAP FILTERING DEBUG ===");

  return Array.from(locationMap.values());
}

export async function fetchRoutes(supabase: SupabaseClient): Promise<Route[]> {

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

  // Fetch user_info separately for route_dots (avoid ambiguous relationships)
  const routeDotUserIds = new Set<string>(
    routeDotsData
      .filter((dot) => !dot.hub_id) // Only fetch user_info for non-hub dots
      .map((dot) => dot.user_id)
  );

  // Fetch hubs for route_dots with hub_id
  const routeDotHubIds = new Set<string>(
    routeDotsData
      .filter((dot) => dot.hub_id)
      .map((dot) => dot.hub_id!)
      .filter((id): id is string => id !== null)
  );

  // Fetch hubs for route dots (always from database, snapshot handled in map info)
  const [routeDotUserInfo, routeDotHubs] = await Promise.all([
    routeDotUserIds.size > 0
      ? supabase
          .from("user_info")
          .select("user_id, user_name")
          .in("user_id", Array.from(routeDotUserIds))
      : Promise.resolve({ data: [], error: null }),
    routeDotHubIds.size > 0
      ? supabase
          .from("hubs")
          .select("id, name")
          .in("id", Array.from(routeDotHubIds))
      : Promise.resolve({ data: [], error: null }),
  ]);

  // Create lookup maps
  const routeDotUserInfoMap = new Map<string, string>();
  routeDotUserInfo.data?.forEach((user) => {
    if (user.user_name) {
      routeDotUserInfoMap.set(user.user_id, user.user_name);
    }
  });

  const routeDotHubsMap = new Map<string, string>();
  routeDotHubs.data?.forEach((hub) => {
    if (hub.name) {
      routeDotHubsMap.set(hub.id, hub.name);
    }
  });

  // Transform the data
  const transformedRoutes: Route[] = routesData.map((route) => ({
    ...route,
    dots: routeDotsData
      .filter((dot) => dot.route_id === route.id)
      .map((dot) => {
        const mapInfo = ensureArray(dot.map_info)[0];
        const userName = dot.hub_id
          ? (routeDotHubsMap.get(dot.hub_id) ||
              ensureArray(dot.hubs)[0]?.name ||
              "Unknown Hub")
          : routeDotUserInfoMap.get(dot.user_id) || "Unknown User";

        return {
          id: dot.id,
          route_step: dot.route_step,
          latitude: mapInfo.latitude,
          longitude: mapInfo.longitude,
          formatted_address: mapInfo.formatted_address,
          user_name: userName,
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
