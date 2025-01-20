import { config } from "@/env";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // First, fetch from participant_details
    const { data: participantDetails, error: participantDetailsError } =
      await supabase
        .from("participant_details")
        .select(
          `
        slug,
        is_sticky,
        status,
        user_id
      `
        )
        .eq("status", "accepted")
        .eq("is_sticky", false)
        .limit(30);

    if (participantDetailsError) {
      console.error(
        "Error fetching participant details:",
        participantDetailsError
      );
      throw participantDetailsError;
    }

    // Get the user_ids from the fetched participant_details
    const userIds = participantDetails.map((detail) => detail.user_id);

    // Now fetch the corresponding user_info
    const { data: userData, error: userDataError } = await supabase
      .from("user_info")
      .select(
        `
        user_id,
        user_name,
        participant_image (
          image_url
        )
      `
      )
      .in("user_id", userIds);

    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      throw userDataError;
    }

    // Combine the data
    const combinedData = participantDetails.map((detail) => {
      const user = userData.find((u) => u.user_id === detail.user_id);
      if (!user) {
        console.warn(`No user found for user_id: ${detail.user_id}`);
      }
      return { ...detail, ...user };
    });

    // Randomize and limit to 15 participants
    const randomParticipants = combinedData
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);

    // Transform participants data
    const transformedParticipants = randomParticipants.map((participant) => ({
      userId: participant.user_id,
      slug: participant.slug || "",
      userName: participant.user_name || "Unknown User",
      image: {
        image_url:
          participant.participant_image?.[0]?.image_url ||
          "/participant-placeholder.jpg",
        alt:
          `${
            participant.user_name || "Unknown User"
          } profile image - participant from GLUE design routes in ${
            config.cityName
          }` || `GLUE participant profile image from ${config.cityName}`,
      },
    }));

    // Fetch header data after processing participants
    const { data: headerData, error: headerError } = await supabase
      .from("about_participants")
      .select("title,description")
      .single();

    if (headerError) {
      console.error("Error fetching header data:", headerError);
      throw headerError;
    }

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
