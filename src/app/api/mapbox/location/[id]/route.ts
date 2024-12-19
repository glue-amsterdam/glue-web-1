import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: locationData, error: locationError } = await supabase
      .from("map_info")
      .select(
        `
        *,
        user_info:user_id (
          user_id,
          user_name,
          participant_details (
            slug
          ),
          participant_image (
            image_url
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (locationError) throw locationError;

    if (!locationData) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Fetch hub information if it exists
    const { data: hubData, error: hubError } = await supabase
      .from("hubs")
      .select(
        `
        *,
        hub_participants (
          user_id,
          user_info:user_id (
            user_name,
            participant_details (
              slug
            ),
            participant_image (
              image_url
            )
          )
        )
      `
      )
      .eq("hub_host_id", locationData.user_id)
      .single();

    if (hubError && hubError.code !== "PGRST116") throw hubError;

    let participants = [
      {
        user_id: locationData.user_info.user_id,
        user_name: locationData.user_info.user_name,
        is_host: true,
        slug: locationData.user_info.participant_details?.[0]?.slug || null,
        image_url:
          locationData.user_info.participant_image?.[0]?.image_url || null,
      },
    ];

    if (hubData) {
      participants = participants.concat(
        hubData.hub_participants.map(
          (participant: {
            user_id: string;
            user_info: {
              user_name: string;
              participant_details: { slug: string }[];
              participant_image: { image_url: string }[];
            };
          }) => ({
            user_id: participant.user_id,
            user_name: participant.user_info.user_name,
            is_host: false,
            slug: participant.user_info.participant_details?.[0]?.slug || null,
            image_url:
              participant.user_info.participant_image?.[0]?.image_url || null,
          })
        )
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
