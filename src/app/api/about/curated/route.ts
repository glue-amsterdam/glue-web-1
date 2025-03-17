import { CuratedParticipantWithYear } from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { config } from "@/env";

type ParticipantDetails = {
  slug: string;
  is_sticky: boolean;
  year: number;
};

type Participant = {
  user_id: string;
  user_name: string;
  participant_details: ParticipantDetails | ParticipantDetails[];
  participant_image?: { image_url: string }[];
};

// Extended type to include image information
type CuratedParticipantWithYearAndImage = CuratedParticipantWithYear & {
  userId: string;
  image: {
    image_url: string;
    alt: string;
  };
};

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch curated about data
    const { data: curatedData, error: curatedError } = await supabase
      .from("about_curated")
      .select("title,description,is_visible")
      .single();

    if (curatedError) {
      throw new Error(
        `Failed to fetch curated about data: ${curatedError.message}`
      );
    }

    if (!curatedData.is_visible) {
      return NextResponse.json({
        headerData: {
          title: "",
          description: "",
          is_visible: false,
        },
        curatedParticipants: {},
      });
    }

    // Fetch all participants with image data
    const { data: allParticipants, error: participantsError } =
      await supabase.from("user_info").select(`
        user_id,
        user_name,
        participant_details (
          slug,
          is_sticky,
          year
        ),
        participant_image (
          image_url
        )
      `);

    if (participantsError) {
      throw new Error(
        `Failed to fetch participants: ${participantsError.message}`
      );
    }

    if (!Array.isArray(allParticipants)) {
      throw new Error(
        "Unexpected data structure: allParticipants is not an array"
      );
    }

    // Filter and transform participants
    const curatedParticipants = allParticipants
      .flatMap((participant: Participant) => {
        const details = Array.isArray(participant.participant_details)
          ? participant.participant_details
          : [participant.participant_details];

        return details
          .filter(
            (detail): detail is ParticipantDetails =>
              detail && typeof detail === "object" && detail.is_sticky === true
          )
          .map((detail) => ({
            slug: detail.slug,
            userName: participant.user_name,
            year: detail.year,
            userId: participant.user_id,
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
      })
      .filter(
        (participant): participant is CuratedParticipantWithYearAndImage =>
          participant.slug !== undefined && participant.year !== undefined
      );

    // Group participants by year
    const groupedByYear = curatedParticipants.reduce<
      Record<number, CuratedParticipantWithYearAndImage[]>
    >((acc, participant) => {
      if (!acc[participant.year]) {
        acc[participant.year] = [];
      }
      acc[participant.year].push(participant);
      return acc;
    }, {});

    // Sort each year's participants
    Object.values(groupedByYear).forEach((yearGroup) => {
      yearGroup.sort((a, b) => a.userName.localeCompare(b.userName));
    });

    return NextResponse.json({
      headerData: curatedData,
      curatedParticipants: groupedByYear,
    });
  } catch (error) {
    console.error("Error in curated participants API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch curated participants data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
