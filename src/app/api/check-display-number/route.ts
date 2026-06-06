import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkDisplayNumberAvailable } from "@/lib/numbers/check-display-number-available";

export async function POST(request: Request) {
  try {
    const { displayNumber, entityType, entityId } = await request.json();

    if (!displayNumber || !entityType) {
      return NextResponse.json(
        { error: "Display number and entity type are required" },
        { status: 400 }
      );
    }

    if (entityType !== "participant" && entityType !== "hub") {
      return NextResponse.json(
        { error: "Invalid entity type. Must be 'participant' or 'hub'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const availability = await checkDisplayNumberAvailable({
      supabase,
      displayNumber,
      entityType,
      entityId,
    });

    if (availability.error) {
      console.error("Error checking display number:", {
        error: availability.error,
        displayNumber,
        entityType,
        entityId,
      });
      return NextResponse.json(
        {
          error: "Failed to check display number availability",
          details:
            availability.error instanceof Error
              ? availability.error.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isAvailable: availability.isAvailable,
      occupants: availability.occupants,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
