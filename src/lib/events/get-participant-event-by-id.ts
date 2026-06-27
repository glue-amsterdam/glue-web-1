import { cache } from "react";
import type { EventType } from "@/schemas/eventsSchemas";
import { toMediaUrl } from "@/lib/media/media-url";
import { createClient } from "@/utils/supabase/server";

export const getParticipantEventById = cache(async (
  userId: string,
  eventId: string
): Promise<EventType | null> => {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, title, organizer_id, image_url, start_time, end_time, type, description, rsvp, rsvp_message, rsvp_link, location_id, co_organizers, dayId"
    )
    .eq("id", eventId)
    .eq("organizer_id", userId)
    .eq("is_last_year_event", false)
    .eq("event_day_out", false)
    .maybeSingle();

  if (error) {
    console.error("getParticipantEventById:", error);
    return null;
  }

  if (!event) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    organizer_id: event.organizer_id,
    image_url: toMediaUrl(event.image_url) ?? "",
    start_time: event.start_time,
    end_time: event.end_time,
    type: event.type,
    description: event.description,
    rsvp: event.rsvp ?? false,
    rsvp_message: event.rsvp_message ?? "",
    rsvp_link: event.rsvp_link ?? "",
    location_id: event.location_id ?? "",
    co_organizers: event.co_organizers ?? [],
    dayId: event.dayId,
  };
});
