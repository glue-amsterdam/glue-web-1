import { config } from "@/env";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch header data first
    const { data: headerData, error: headerError } = await supabase
      .from("about_participants")
      .select("title,is_visible,text_color,description,background_color")
      .single();

    if (headerError) {
      console.error("Error fetching header data:", headerError);
      throw headerError;
    }

    // If not visible, return early with only header data
    if (!headerData.is_visible) {
      return NextResponse.json({
        headerData: {
          title: "",
          description: "",
          is_visible: false,
          text_color: "#fff",
          background_color: "#000000",
        },
        participants: [],
      });
    }

    // Fetch tour status to determine filtering logic
    const { data: tourStatus, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("current_tour_status")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
      // Default to "new" if tour status fetch fails
    }

    const currentTourStatus = tourStatus?.current_tour_status || "new";

    // Query participants based on tour status
    // If "new": filter by is_active = true
    // If "older": filter by was_active_last_year = true
    let participantQuery = supabase
      .from("participant_details")
      .select(
        `
        slug,
        user_id,
        status,
        short_description,
        user_info!participant_details_user_id_fkey (
          user_id,
          user_name
        )
      `
      )
      .eq("status", "accepted");

    if (currentTourStatus === "new") {
      participantQuery = participantQuery.eq("is_active", true);
    } else if (currentTourStatus === "older") {
      participantQuery = participantQuery.eq("was_active_last_year", true);
    }

    const { data: participantsData, error: participantsError } =
      await participantQuery;

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    if (!participantsData || participantsData.length === 0) {
      return NextResponse.json({
        headerData,
        participants: [],
      });
    }

    // Shuffle participants randomly and limit to 20
    const shuffled = [...participantsData].sort(() => Math.random() - 0.5);
    const participants = shuffled.slice(0, 20);

    // Fetch participant images separately (no foreign key relationship exists)
    const participantIds = participants.map((p: any) => p.user_id);
    const { data: imageData, error: imageError } = await supabase
      .from("participant_image")
      .select("user_id, image_url")
      .in("user_id", participantIds);

    if (imageError) {
      console.error("Error fetching participant images:", imageError);
      // Don't throw - continue without images
    }

    // Create image lookup map
    const imageMap = new Map<string, string>();
    imageData?.forEach((image) => {
      if (!imageMap.has(image.user_id)) {
        imageMap.set(image.user_id, image.image_url);
      }
    });

    // Transform data for frontend
    const transformedParticipants = participants.map((participant: any) => {
      const userInfo = Array.isArray(participant.user_info)
        ? participant.user_info[0]
        : participant.user_info;

      return {
        slug: participant.slug || "",
        short_description: participant.short_description || "",
        userName: userInfo?.user_name || "Unknown User",
        image: {
          image_url: imageMap.get(participant.user_id) || "/placeholder.jpg",
          alt: `${
            userInfo?.user_name || "Unknown User"
          } profile image - participant from GLUE design routes in ${
            config.cityName
          }`,
        },
      };
    });

    const response = {
      headerData,
      participants: transformedParticipants,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants section data" },
      { status: 500 }
    );
  }
}
