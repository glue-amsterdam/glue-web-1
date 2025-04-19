import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cache } from "react";

// Create a server-side cache with a TTL
interface LocationData {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  is_hub: boolean;
  is_collective: boolean;
  is_special_program: boolean;
  hub_name: string | null;
  hub_description: string | null;
  participants: Array<{
    user_id: string;
    user_name: string;
    is_host: boolean;
    slug: string | null;
    image_url: string | null;
  }>;
}

const locationCache = new Map<
  string,
  { data: LocationData; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cached Supabase client
const getSupabaseClient = cache(async () => {
  return await createClient();
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check cache first
  const cachedData = locationCache.get(id);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    // Set cache control headers
    return NextResponse.json(cachedData.data, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes
        "CDN-Cache-Control": "public, max-age=300",
        "Vercel-CDN-Cache-Control": "public, max-age=300",
      },
    });
  }

  try {
    const supabase = await getSupabaseClient();

    // Fetch location data
    const { data: locationData, error: locationError } = await supabase
      .from("map_info")
      .select("*")
      .eq("id", id)
      .single();

    if (locationError) throw locationError;
    if (!locationData) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    let responseData;

    // Check if the location is a hub
    const { data: hubData, error: hubError } = await supabase
      .from("hubs")
      .select("*")
      .eq("hub_host_id", locationData.user_id)
      .single();

    if (hubError && hubError.code !== "PGRST116") throw hubError;

    if (hubData) {
      // Fetch hub participants
      const { data: hubParticipants, error: hubParticipantsError } =
        await supabase
          .from("hub_participants")
          .select("user_id")
          .eq("hub_id", hubData.id);

      if (hubParticipantsError) throw hubParticipantsError;

      const userIds = hubParticipants.map((p) => p.user_id);

      // Bulk fetch related data in parallel
      const [
        { data: userInfos },
        { data: participantDetails },
        { data: participantImages },
      ] = await Promise.all([
        supabase
          .from("user_info")
          .select("user_id, user_name")
          .in("user_id", userIds),
        supabase
          .from("participant_details")
          .select("user_id, slug")
          .in("user_id", userIds)
          .eq("status", "accepted"),
        supabase
          .from("participant_image")
          .select("user_id, image_url")
          .in("user_id", userIds)
          .order("id", { ascending: true }),
      ]);

      // Create lookup maps
      const imageMap = new Map(
        participantImages?.reduce((acc, image) => {
          if (!acc.some(([uid]) => uid === image.user_id)) {
            acc.push([image.user_id, image.image_url]);
          }
          return acc;
        }, [] as [string, string][]) || []
      );

      const userMap = new Map(userInfos?.map((u) => [u.user_id, u]) || []);
      const detailsMap = new Map(
        participantDetails?.map((d) => [d.user_id, d]) || []
      );

      // Build participants array
      const participants = userIds
        .map((userId) => {
          const user = userMap.get(userId);
          const detail = detailsMap.get(userId);
          if (!user || !detail) return null;

          return {
            user_id: userId as string,
            user_name: user.user_name as string,
            is_host: userId === locationData.user_id,
            slug: detail.slug as string | null,
            image_url: imageMap.get(userId) || null,
          };
        })
        .filter(
          (participant): participant is NonNullable<typeof participant> =>
            participant !== null
        );

      responseData = {
        id: locationData.id,
        formatted_address: locationData.formatted_address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        is_hub: true,
        is_collective: false,
        is_special_program: false,
        hub_name: hubData.name,
        hub_description: hubData.description,
        participants,
      };
    } else {
      // Handle non-hub case
      const [
        { data: userData },
        { data: participantData },
        { data: imageData },
      ] = await Promise.all([
        supabase
          .from("user_info")
          .select("user_id, user_name")
          .eq("user_id", locationData.user_id)
          .single(),
        supabase
          .from("participant_details")
          .select("slug, status")
          .eq("user_id", locationData.user_id)
          .single(),
        supabase
          .from("participant_image")
          .select("image_url")
          .eq("user_id", locationData.user_id)
          .limit(1),
      ]);

      responseData = {
        id: locationData.id,
        formatted_address: locationData.formatted_address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        is_hub: false,
        is_collective: !!locationData.is_collective,
        is_special_program: !!locationData.is_special_program,
        hub_name: null,
        hub_description: null,
        participants: [
          {
            user_id: locationData.user_id,
            user_name: userData?.user_name || "",
            is_host: true,
            slug: participantData?.slug || null,
            image_url: imageData?.[0]?.image_url || null,
          },
        ],
      };
    }

    // Update cache
    locationCache.set(id, { data: responseData, timestamp: Date.now() });

    // Return response with cache headers
    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes
        "CDN-Cache-Control": "public, max-age=300",
        "Vercel-CDN-Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Error fetching location information:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
