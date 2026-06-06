import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  checkDisplayNumberAvailable,
  normalizeDisplayNumberInput,
} from "@/lib/numbers/check-display-number-available";
import { revalidateDisplayNumberCaches } from "@/lib/numbers/revalidate-display-number-caches";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { z } from "zod";

const patchDisplayNumberSchema = z.object({
  entityType: z.enum(["participant", "hub"]),
  entityId: z.string().uuid(),
  displayNumber: z.string().max(10).nullable(),
});

export async function PATCH(request: Request) {
  const modCheck = await requirePlatformMod();
  if (!modCheck.ok) {
    return modCheck.response;
  }

  try {
    const body = await request.json();
    const { entityType, entityId, displayNumber } =
      patchDisplayNumberSchema.parse(body);
    const normalizedDisplayNumber = normalizeDisplayNumberInput(displayNumber);

    const supabase = await createClient();

    if (normalizedDisplayNumber) {
      const availability = await checkDisplayNumberAvailable({
        supabase,
        displayNumber: normalizedDisplayNumber,
        entityType,
        entityId,
      });

      if (availability.error) {
        console.error("Error checking display number:", availability.error);
        return NextResponse.json(
          { error: "Failed to check display number availability" },
          { status: 500 }
        );
      }

      if (!availability.isAvailable) {
        return NextResponse.json(
          {
            error: "Display number is already in use",
            occupants: availability.occupants,
          },
          { status: 409 }
        );
      }
    }

    const table = entityType === "participant" ? "participant_details" : "hubs";
    const idColumn = entityType === "participant" ? "user_id" : "id";

    const { data, error } = await supabase
      .from(table)
      .update({ display_number: normalizedDisplayNumber })
      .eq(idColumn, entityId)
      .select("display_number")
      .single();

    if (error) {
      console.error("Error updating display number:", error);
      return NextResponse.json(
        { error: "Failed to update display number" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    await revalidateDisplayNumberCaches(supabase);

    return NextResponse.json({
      success: true,
      displayNumber: data.display_number,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unexpected error updating display number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
