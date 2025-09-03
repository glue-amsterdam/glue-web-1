import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { displayNumber, entityType, entityId } = await request.json();

    if (!displayNumber || !entityType) {
      return NextResponse.json(
        { error: "Display number and entity type are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if display number is available across BOTH tables
    let isAvailable = true;
    let error = null;

    try {
      // Check participants table
      let participantQuery = supabase
        .from("participant_details")
        .select("user_id")
        .eq("display_number", displayNumber);

      // Only exclude current entity if we're editing a participant
      if (entityType === "participant" && entityId) {
        participantQuery = participantQuery.neq("user_id", entityId);
      }

      const { data: participantData, error: participantError } =
        await participantQuery;

      if (participantError) {
        error = participantError;
      } else {
        // Check hubs table
        let hubQuery = supabase
          .from("hubs")
          .select("id")
          .eq("display_number", displayNumber);

        // Only exclude current entity if we're editing a hub
        if (entityType === "hub" && entityId) {
          hubQuery = hubQuery.neq("id", entityId);
        }

        const { data: hubData, error: hubError } = await hubQuery;

        if (hubError) {
          error = hubError;
        } else {
          // Display number is available only if it's not used in either table
          isAvailable = participantData.length === 0 && hubData.length === 0;
        }
      }
    } catch (err) {
      error = err;
    }

    // Validate entity type
    if (entityType !== "participant" && entityType !== "hub") {
      return NextResponse.json(
        { error: "Invalid entity type. Must be 'participant' or 'hub'" },
        { status: 400 }
      );
    }

    if (error) {
      console.error("Error checking display number:", {
        error,
        displayNumber,
        entityType,
        entityId,
      });
      return NextResponse.json(
        {
          error: "Failed to check display number availability",
          details:
            error instanceof Error ? error.message : "Unknown database error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ isAvailable });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
