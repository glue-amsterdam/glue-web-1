import {
  ParticipantClient,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
    const { data: participants, error: participantsError } = await supabase
      .from("user_info")
      .select(
        `
        id,
        user_name,
        participant_details!inner (
          slug,
          is_sticky
        ),
        participant_image (
          image_url
        )
      `
      )
      .eq("participant_details.is_sticky", false)
      .order("id")
      .limit(100);

    if (participantsError) {
      throw participantsError;
    }

    // Randomize and limit to 15 participants
    const randomParticipants = participants
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);

    // Transform participants data
    const transformedParticipants: ParticipantClient[] = randomParticipants.map(
      (participant) => ({
        userId: participant.id,
        slug: participant.participant_details?.[0]?.slug || "",
        userName: participant.user_name,
        image: {
          image_url:
            participant.participant_image?.[0]?.image_url ||
            "/participant-placeholder.jpg",
          alt:
            `${participant.user_name} profile image - participant from GLUE desing routes in ${process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT}` ||
            `GLUE participant profile image from ${process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT}`,
        },
      })
    );

    const response = {
      headerData,
      participants: transformedParticipants,
    };

    // Validate response with client schema
    const validatedResponse = participantsResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error fetching participants:", error);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch participants section data" },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to fetch participants section data", details: error },
        { status: 500 }
      );
    }
  }
}
