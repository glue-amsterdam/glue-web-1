import { CuratedParticipantWithYear } from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type ParticipantDetails = {
  slug: string;
  is_sticky: boolean;
  year: number;
};

type Participant = {
  user_name: string;
  participant_details: ParticipantDetails | ParticipantDetails[];
};

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch curated about data
    const { data: curatedData, error: curatedError } = await supabase
      .from("about_curated")
      .select("title,description")
      .single();

    if (curatedError) {
      throw new Error(
        `Failed to fetch curated about data: ${curatedError.message}`
      );
    }

    // Fetch all participants
    const { data: allParticipants, error: participantsError } =
      await supabase.from("user_info").select(`
        user_name,
        participant_details (
          slug,
          is_sticky,
          year
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
          }));
      })
      .filter(
        (participant): participant is CuratedParticipantWithYear =>
          participant.slug !== undefined && participant.year !== undefined
      );

    // Group participants by year
    const groupedByYear = curatedParticipants.reduce<
      Record<number, CuratedParticipantWithYear[]>
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
      curatedParticipants: groupedByYear,
      headerData: curatedData,
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
