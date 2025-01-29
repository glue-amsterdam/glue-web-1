import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();

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

      // Bulk fetch related data
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
            user_id: userId,
            user_name: user.user_name,
            is_host: userId === locationData.user_id,
            slug: detail.slug,
            image_url: imageMap.get(userId) || null,
          };
        })
        .filter(Boolean);

      return NextResponse.json({
        id: locationData.id,
        formatted_address: locationData.formatted_address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        is_hub: true,
        hub_name: hubData.name,
        hub_description: hubData.description,
        participants,
      });
    }

    // Handle non-hub case
    const [{ data: userData }, { data: participantData }, { data: imageData }] =
      await Promise.all([
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

    return NextResponse.json({
      id: locationData.id,
      formatted_address: locationData.formatted_address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      is_hub: false,
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
    });
  } catch (error) {
    console.error("Error fetching location information:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
