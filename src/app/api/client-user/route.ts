import { createClient } from "@/utils/supabase/server";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface ParticipantDetails {
  slug: string;
  user_id: string;
  display_name: string | null;
}

interface ParticipantImage {
  user_id: string;
  image_url: string;
}

interface ParticipantWithImage {
  slug: string;
  user_id: string;
  user_name: string;
  image_url: string | null;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: tourStatus, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("current_tour_status")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
    }

    const currentTourStatus = tourStatus?.current_tour_status || "new";

    let participantQuery = supabase
      .from("participant_details")
      .select(
        `
          slug,
          user_id,
          status,
          is_active,
          display_name
        `
      )
      .eq("status", "accepted");

    if (currentTourStatus === "new") {
      participantQuery = participantQuery.eq("is_active", true);
    } else if (currentTourStatus === "older") {
      participantQuery = participantQuery.eq("was_active_last_year", true);
    }

    const { data: participantData, error: participantError } =
      (await participantQuery) as {
        data: ParticipantDetails[] | null;
        error: PostgrestError;
      };

    if (participantError) {
      throw participantError;
    }

    if (!participantData || participantData.length === 0) {
      return NextResponse.json(
        { error: "No participants found" },
        { status: 404 }
      );
    }

    const { data: imageData, error: imageError } = (await supabase
      .from("participant_image")
      .select("user_id, image_url")
      .in(
        "user_id",
        participantData.map((p) => p.user_id)
      )) as { data: ParticipantImage[] | null; error: PostgrestError };

    if (imageError) {
      throw imageError;
    }

    const participantsWithImages: ParticipantWithImage[] = participantData.map(
      (participant) => {
        const image = imageData?.find(
          (img) => img.user_id === participant.user_id
        );
        return {
          slug: participant.slug,
          user_id: participant.user_id,
          user_name: getParticipantDisplayName(participant),
          image_url: image ? image.image_url : null,
        };
      }
    );

    const shuffledParticipants = shuffleArray(participantsWithImages);

    return NextResponse.json({
      participants: shuffledParticipants,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
