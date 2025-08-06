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

    // Llama al nuevo RPC que ya trae todo lo necesario
    const { data: participants, error: participantsError } = await supabase.rpc(
      "get_random_participants_full",
      {
        limit_count: 20,
      }
    );

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    interface ParticipantResponse {
      slug: string;
      status: "accepted" | "pending" | "rejected";
      short_description: string;
      user_id: string;
      image_url: string | null;
      user_name: string;
    }

    // Transforma los datos para el frontend
    const transformedParticipants = participants.map(
      (participant: ParticipantResponse) => ({
        slug: participant.slug || "",
        short_description: participant.short_description || "",
        userName: participant.user_name || "Unknown User",
        image: {
          image_url: participant.image_url || "/placeholder.jpg",
          alt: `${
            participant.user_name || "Unknown User"
          } profile image - participant from GLUE design routes in ${
            config.cityName
          }`,
        },
      })
    );

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
