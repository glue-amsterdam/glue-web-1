import { config } from "@/config";
import { loadOrganizerProfiles } from "@/lib/participants/load-organizer-profiles";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type ParticipantDetailsEmbed =
  | { slug?: string | null }
  | Array<{ slug?: string | null }>
  | null
  | undefined;

const slugFromEmbed = (participantDetails: ParticipantDetailsEmbed): string => {
  if (!participantDetails) return "";
  if (Array.isArray(participantDetails)) {
    return participantDetails[0]?.slug ?? "";
  }
  return participantDetails.slug ?? "";
};

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

    const { data: tourStatus, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("current_tour_status")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
    }

    const currentTourStatus = tourStatus?.current_tour_status || "new";

    let eventQuery = supabase
      .from("events")
      .select(
        `
          *,
          location:map_info!location_id (
            id,
            formatted_address
          )
        `
      )
      .eq("id", eventId)
      .eq("event_day_out", false);

    if (currentTourStatus === "new") {
      eventQuery = eventQuery.eq("is_last_year_event", false);
    } else if (currentTourStatus === "older") {
      eventQuery = eventQuery.eq("is_last_year_event", true);
    }

    const { data: event, error: eventError } = await eventQuery.single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.event_day_out || event.dayId === "day-off") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let eventDay = null;
    if (event.dayId) {
      if (currentTourStatus === "new") {
        const { data: dayData, error: dayError } = await supabase
          .from("events_days")
          .select("dayId, label, date")
          .eq("dayId", event.dayId)
          .single();

        if (!dayError && dayData) {
          eventDay = { label: dayData.label, date: dayData.date };
        }
      } else if (currentTourStatus === "older") {
        const { data: tourStatusData, error: tourStatusError } = await supabase
          .from("tour_status")
          .select("previous_tour_event_days")
          .single();

        if (!tourStatusError && tourStatusData) {
          const snapshot = tourStatusData.previous_tour_event_days as
            | Array<{ dayId: string; label: string; date: string | null }>
            | null;
          const dayData = snapshot?.find((day) => day.dayId === event.dayId);
          if (dayData) {
            eventDay = { label: dayData.label, date: dayData.date };
          }
        }
      }
    }

    if (!event.dayId || !eventDay) {
      return NextResponse.json(
        { error: "Event not found or event day is not valid" },
        { status: 404 }
      );
    }

    const organizerUserIds = [
      ...(event.organizer_id ? [event.organizer_id] : []),
      ...(event.co_organizers ?? []),
    ];
    const organizerProfiles = await loadOrganizerProfiles(
      supabase,
      organizerUserIds
    );
    const organizerProfile = event.organizer_id
      ? organizerProfiles.get(event.organizer_id)
      : undefined;

    const enhancedEvent = {
      eventId: event.id,
      name: event.title,
      description: event.description || "",
      type: event.type || "",
      date: {
        dayId: event.dayId,
        label: eventDay?.label || "",
        date: eventDay?.date || "",
      },
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      thumbnail: {
        image_url: event.image_url || "",
        alt: `${event.title} - event from GLUE design routes in ${config.cityName}`,
      },
      organizer: {
        user_id: organizerProfile?.user_id || "",
        user_name: organizerProfile?.user_name || "Unknown",
        slug: slugFromEmbed(organizerProfile?.participant_details),
      },
      location: {
        id: event.location?.id || "",
        formatted_address: event.location?.formatted_address || "",
      },
      coOrganizers: (event.co_organizers ?? [])
        .map((userId: string) => organizerProfiles.get(userId))
        .filter(Boolean)
        .map((co) => ({
          user_id: co!.user_id,
          user_name: co!.user_name,
          slug: slugFromEmbed(co!.participant_details),
        })),
      rsvp: event.rsvp ?? false,
      rsvpMessage: event.rsvp_message || "",
      rsvpLink: event.rsvp_link || "",
      createdAt: event.created_at || "",
      updatedAt: event.updated_at || "",
    };

    return NextResponse.json(enhancedEvent);
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
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select();
    if (error) {
      console.error("Error updating event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
