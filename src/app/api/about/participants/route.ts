import { config } from "@/env";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Define a more flexible type that accounts for Supabase's inferred types
type ParticipantRaw = {
  id: string;
  user_name: string;
  participant_details:
    | {
        slug: string;
        is_sticky: boolean;
      }
    | {
        slug: string;
        is_sticky: boolean;
      }[];
  participant_image: Array<{ image_url: string }>;
};

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch header data
    const { data: headerData, error: headerError } = await supabase
      .from("about_participants")
      .select("title,description")
      .single();

    if (headerError) {
      throw headerError;
    }

    // Fetch participants
    const { data, error: participantsError } = await supabase
      .from("user_info")
      .select(
        `
    id,
    user_name,
    plan_type,
    participant_details (
      slug,
      is_sticky,
      status
    ),
    participant_image (
      image_url
    )
  `
      )
      .eq("plan_type", "participant")
      .eq("participant_details.status", "accepted")
      .eq("participant_details.is_sticky", false)
      .limit(30);

    if (participantsError) {
      throw participantsError;
    }

    // Assert the type of the data
    const participantsRaw = data as ParticipantRaw[];

    // Randomize and limit to 15 participants
    const randomParticipants = participantsRaw
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);

    // Transform participants data
    const transformedParticipants = randomParticipants.map((participant) => {
      const details = Array.isArray(participant.participant_details)
        ? participant.participant_details[0]
        : participant.participant_details;

      return {
        userId: participant.id,
        slug: details?.slug || "",
        userName: participant.user_name,
        image: {
          image_url:
            participant.participant_image[0]?.image_url ||
            "/participant-placeholder.jpg",
          alt:
            `${participant.user_name} profile image - participant from GLUE design routes in ${config.cityName}` ||
            `GLUE participant profile image from ${config.cityName}`,
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
