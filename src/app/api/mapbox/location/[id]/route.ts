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

    // Fetch user info for the location owner
    const { data: userData, error: userError } = await supabase
      .from("user_info")
      .select("user_id, user_name")
      .eq("user_id", locationData.user_id)
      .single();

    if (userError) throw userError;

    // Fetch participant details for the location owner
    const { data: participantData, error: participantError } = await supabase
      .from("participant_details")
      .select("slug, status")
      .eq("user_id", locationData.user_id)
      .single();

    if (participantError) throw participantError;

    // Fetch participant image for the location owner
    const { data: imageData, error: imageError } = await supabase
      .from("participant_image")
      .select("image_url")
      .eq("user_id", locationData.user_id)
      .single();

    if (imageError && imageError.code !== "PGRST116") throw imageError;

    // Fetch hub information if it exists
    const { data: hubData, error: hubError } = await supabase
      .from("hubs")
      .select("*")
      .eq("hub_host_id", locationData.user_id)
      .single();

    if (hubError && hubError.code !== "PGRST116") throw hubError;

    let participants = [
      {
        user_id: userData.user_id,
        user_name: userData.user_name,
        is_host: true,
        slug: participantData?.slug || null,
        image_url: imageData?.image_url || null,
      },
    ];

    if (hubData) {
      // Fetch hub participants
      const { data: hubParticipants, error: hubParticipantsError } =
        await supabase
          .from("hub_participants")
          .select("user_id")
          .eq("hub_id", hubData.id);

      if (hubParticipantsError) throw hubParticipantsError;

      // Fetch user info, participant details, and images for hub participants
      const hubParticipantPromises = hubParticipants.map(
        async (participant) => {
          const [userInfo, participantDetails, participantImage] =
            await Promise.all([
              supabase
                .from("user_info")
                .select("user_name")
                .eq("user_id", participant.user_id)
                .single(),
              supabase
                .from("participant_details")
                .select("slug, status")
                .eq("user_id", participant.user_id)
                .eq("status", "accepted")
                .single(),
              supabase
                .from("participant_image")
                .select("image_url")
                .eq("user_id", participant.user_id)
                .single(),
            ]);

          if (participantDetails.data) {
            return {
              user_id: participant.user_id,
              user_name: userInfo.data?.user_name || "",
              is_host: false,
              slug: participantDetails.data.slug || null,
              image_url: participantImage.data?.image_url || null,
            };
          }
          return null;
        }
      );

      const hubParticipantsData = (
        await Promise.all(hubParticipantPromises)
      ).filter(Boolean);
      participants = participants.concat(
        hubParticipantsData.filter((participant) => participant !== null)
      );
    }

    const transformedData = {
      id: locationData.id,
      formatted_address: locationData.formatted_address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      is_hub: !!hubData,
      hub_name: hubData?.name,
      hub_description: hubData?.description,
      participants: participants,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching detailed location information:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
