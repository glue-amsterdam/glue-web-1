import { config } from "@/config";
import { validateEventWrite } from "@/lib/events/validate-event-write";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { revalidateProgramCacheIfLiveTour } from "@/lib/program/revalidate-program-cache";
import { getProgramDetail } from "@/lib/program/get-program-detail";
import { ProgramNotFoundError } from "@/lib/program/program-types";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  if (!eventId)
    return NextResponse.json(
      { error: "Event ID is required" },
      { status: 400 }
    );

  try {
    const supabase = await createClient();

    try {
      const detail = await getProgramDetail(supabase, eventId);
      return NextResponse.json({
        eventId: detail.eventId,
        name: detail.name,
        description: detail.description || "",
        type: detail.type || "",
        date: detail.date,
        startTime: detail.startTime,
        endTime: detail.endTime,
        thumbnail: {
          image_url: detail.eventImg || "",
          alt: `${detail.name} - event from GLUE design routes in ${config.cityName}`,
        },
        organizer: {
          user_id: detail.organizer.userId,
          user_name: detail.organizer.userName,
          slug: detail.organizer.slug || "",
        },
        location: {
          id: detail.location?.id || "",
          formatted_address: detail.location?.formattedAddress || "",
        },
        coOrganizers: detail.coOrganizers.map((co) => ({
          user_id: co.userId,
          user_name: co.userName,
          slug: co.slug || "",
        })),
        rsvp: detail.rsvp ?? false,
        rsvpMessage: "",
        rsvpLink: detail.rsvpLink || "",
        createdAt: "",
      });
    } catch (error) {
      if (error instanceof ProgramNotFoundError) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const eventData = await request.json();
    const { eventId } = await params;

    const { data: existingEvent, error: existingEventError } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .maybeSingle();

    if (existingEventError) {
      console.error("Error fetching event:", existingEventError);
      return NextResponse.json(
        { error: existingEventError.message },
        { status: 500 }
      );
    }

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const validation = await validateEventWrite(supabase, eventData, {
      expectedOrganizerId: existingEvent.organizer_id,
    });

    if (!validation.ok) {
      return validation.response;
    }

    const { data, error } = await supabase
      .from("events")
      .update(validation.payload)
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Error updating event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await revalidateProgramCacheIfLiveTour(supabase);

    return NextResponse.json({
      message: "Event updated successfully",
      event: data[0],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { eventId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingEvent, error: existingEventError } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .maybeSingle();

    if (existingEventError) {
      return NextResponse.json(
        { error: existingEventError.message },
        { status: 500 }
      );
    }

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isMod = await getIsPlatformMod(supabase, user.id);
    if (!isMod && user.id !== existingEvent.organizer_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await revalidateProgramCacheIfLiveTour(supabase);

    return NextResponse.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
