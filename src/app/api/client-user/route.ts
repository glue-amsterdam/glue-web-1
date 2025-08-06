import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Define types for our data structures
interface ParticipantDetails {
  slug: string;
  user_id: string;
  user_info: {
    user_name: string;
  };
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

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all participants with user_name from user_info
    const { data: participantData, error: participantError } = (await supabase
      .from("participant_details")
      .select(
        `
          slug, 
          user_id,
          status,
          is_active,
          user_info!inner (
            user_name
          )
        `
      )
      .eq("status", "accepted")
      .eq("is_active", true)) as {
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

    // Fetch images for all participants
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

    // Combine participant data with their images
    const participantsWithImages: ParticipantWithImage[] = participantData.map(
      (participant) => {
        const image = imageData?.find(
          (img) => img.user_id === participant.user_id
        );
        return {
          slug: participant.slug,
          user_id: participant.user_id,
          user_name: participant.user_info.user_name,
          image_url: image ? image.image_url : null,
        };
      }
    );

    return NextResponse.json({
      participants: participantsWithImages,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
