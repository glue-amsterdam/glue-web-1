import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  co_organizers: string[];
  co_organizers_names: string[];
  image_url: string | null;
}

interface Participant {
  id: string;
  user_name: string;
  plan_type: string;
  participant_details: {
    short_description: string | null;
    description: string | null;
    slug: string | null;
    is_sticky: boolean;
    year: number | null;
    status: string;
  };
  image_url: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Query participants
    const participantsQuery = supabase
      .from("user_info")
      .select(
        `
        user_id,
        user_name,
        plan_type
      `
      )
      .filter("user_name", "ilike", `%${query}%`)
      .limit(5);

    // Query events by title or description
    const eventsByTitleQuery = supabase
      .from("events")
      .select(
        `
        id,
        title,
        description,
        organizer_id,
        co_organizers,
        image_url
      `
      )
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);

    const [participantsResult, eventsByTitleResult] = await Promise.all([
      participantsQuery,
      eventsByTitleQuery,
    ]);

    if (participantsResult.error) {
      console.error("Error fetching participants:", participantsResult.error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    if (eventsByTitleResult.error) {
      console.error(
        "Error fetching events by title:",
        eventsByTitleResult.error
      );
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    // Fetch participant details
    const participantIds = participantsResult.data.map((p) => p.user_id);
    const participantDetailsQuery = supabase
      .from("participant_details")
      .select(
        `
        user_id,
        short_description,
        description,
        slug,
        is_sticky,
        year,
        status
      `
      )
      .in("user_id", participantIds)
      .eq("is_active", true)
      .eq("status", "accepted");

    // Fetch participant images
    const participantImagesQuery = supabase
      .from("participant_image")
      .select("user_id, image_url")
      .in("user_id", participantIds);

    const [participantDetailsResult, participantImagesResult] =
      await Promise.all([participantDetailsQuery, participantImagesQuery]);

    if (participantDetailsResult.error) {
      console.error(
        "Error fetching participant details:",
        participantDetailsResult.error
      );
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    if (participantImagesResult.error) {
      console.error(
        "Error fetching participant images:",
        participantImagesResult.error
      );
      return NextResponse.json(
        { error: "Failed to fetch participant images" },
        { status: 500 }
      );
    }

    // Create maps for quick lookup
    const participantDetailsMap = new Map(
      participantDetailsResult.data.map((details) => [details.user_id, details])
    );
    const participantImageMap = new Map(
      participantImagesResult.data.map((img) => [img.user_id, img.image_url])
    );

    // Reshape the participants data
    const formattedParticipants: Participant[] = participantsResult.data
      .filter((participant) => participantDetailsMap.has(participant.user_id))
      .map((participant) => {
        const details = participantDetailsMap.get(participant.user_id)!;
        return {
          id: participant.user_id,
          user_name: participant.user_name,
          plan_type: participant.plan_type,
          participant_details: {
            short_description: details.short_description,
            description: details.description,
            slug: details.slug,
            is_sticky: details.is_sticky,
            year: details.year,
            status: details.status,
          },
          image_url: participantImageMap.get(participant.user_id) ?? null,
        };
      });

    // Fetch organizer and co-organizer names
    const allOrganizerIds = new Set([
      ...eventsByTitleResult.data.map((event) => event.organizer_id),
      ...eventsByTitleResult.data.flatMap((event) => event.co_organizers || []),
    ]);

    const organizerNamesQuery = supabase
      .from("user_info")
      .select("user_id, user_name")
      .in("user_id", Array.from(allOrganizerIds));

    const organizerNamesResult = await organizerNamesQuery;

    if (organizerNamesResult.error) {
      console.error(
        "Error fetching organizer names:",
        organizerNamesResult.error
      );
      return NextResponse.json(
        { error: "Failed to fetch organizer names" },
        { status: 500 }
      );
    }

    const organizerNameMap = new Map(
      organizerNamesResult.data.map((user) => [user.user_id, user.user_name])
    );

    // Reshape the events data
    const formattedEvents: Event[] = eventsByTitleResult.data.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      organizer_id: event.organizer_id,
      organizer_name:
        organizerNameMap.get(event.organizer_id) || "Unknown Organizer",
      co_organizers: Array.isArray(event.co_organizers)
        ? event.co_organizers
        : [],
      co_organizers_names: Array.isArray(event.co_organizers)
        ? event.co_organizers.map(
            (id) => organizerNameMap.get(id) || "Unknown Co-organizer"
          )
        : [],
      image_url: event.image_url,
    }));

    // Only fetch events for participants if we found any participants
    let formattedEventsForParticipants: Event[] = [];
    if (participantIds.length > 0) {
      // Query events organized or co-organized by the found participants
      const eventsForParticipantsQuery = supabase
        .from("events")
        .select(
          `
          id,
          title,
          description,
          organizer_id,
          co_organizers,
          image_url
        `
        )
        .or(
          `organizer_id.in.(${participantIds.join(
            ","
          )}),co_organizers.cs.{${participantIds.join(",")}}`
        )
        .not("id", "in", `(${formattedEvents.map((e) => e.id).join(",")})`)
        .limit(10);

      const eventsForParticipantsResult = await eventsForParticipantsQuery;

      if (eventsForParticipantsResult.error) {
        console.error(
          "Error fetching events for participants:",
          eventsForParticipantsResult.error
        );
        return NextResponse.json(
          { error: "Failed to fetch events for participants" },
          { status: 500 }
        );
      }

      // Fetch additional organizer names if needed
      const additionalOrganizerIds = new Set([
        ...eventsForParticipantsResult.data.map((event) => event.organizer_id),
        ...eventsForParticipantsResult.data.flatMap(
          (event) => event.co_organizers || []
        ),
      ]);

      const newOrganizerIds = Array.from(additionalOrganizerIds).filter(
        (id) => !organizerNameMap.has(id)
      );

      if (newOrganizerIds.length > 0) {
        const additionalOrganizerNamesQuery = supabase
          .from("user_info")
          .select("user_id, user_name")
          .in("user_id", newOrganizerIds);

        const additionalOrganizerNamesResult =
          await additionalOrganizerNamesQuery;

        if (additionalOrganizerNamesResult.error) {
          console.error(
            "Error fetching additional organizer names:",
            additionalOrganizerNamesResult.error
          );
        } else {
          additionalOrganizerNamesResult.data.forEach((user) => {
            organizerNameMap.set(user.user_id, user.user_name);
          });
        }
      }

      // Reshape the events for participants data
      formattedEventsForParticipants = eventsForParticipantsResult.data.map(
        (event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          organizer_id: event.organizer_id,
          organizer_name:
            organizerNameMap.get(event.organizer_id) || "Unknown Organizer",
          co_organizers: Array.isArray(event.co_organizers)
            ? event.co_organizers
            : [],
          co_organizers_names: Array.isArray(event.co_organizers)
            ? event.co_organizers.map(
                (id) => organizerNameMap.get(id) || "Unknown Co-organizer"
              )
            : [],
          image_url: event.image_url,
        })
      );
    }

    // Combine all unique events
    const allEvents: Event[] = [
      ...formattedEvents,
      ...formattedEventsForParticipants,
    ];
    const uniqueEvents = Array.from(new Set(allEvents.map((e) => e.id)))
      .map((id) => allEvents.find((e) => e.id === id))
      .filter((event): event is Event => event !== undefined);

    return NextResponse.json({
      participants: formattedParticipants,
      events: uniqueEvents,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
