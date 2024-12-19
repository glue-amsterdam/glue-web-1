import { CuratedParticipantWithYear } from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch curated about data
    const { data: curatedData, error: curatedError } = await supabase
      .from("about_curated")
      .select("title,description")
      .single();

    if (curatedError) {
      throw new Error("Failed to fetch curated about data");
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
      throw new Error("Failed to fetch participants");
    }

    // Filter and transform participants
    const curatedParticipants = allParticipants
      .filter((participant) =>
        participant.participant_details.some((detail) => detail.is_sticky)
      )
      .map((participant) => {
        const stickyDetail = participant.participant_details.find(
          (detail) => detail.is_sticky
        );
        return {
          slug: stickyDetail?.slug,
          userName: participant.user_name,
          year: stickyDetail?.year,
        };
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
