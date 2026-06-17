import { createClient } from "@/utils/supabase/server";

export type EventSummary = {
  id: string;
  title: string;
  type: string;
  dayId: string;
  dayLabel: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
};

export const getParticipantEventsSummary = async (
  userId: string
): Promise<EventSummary[]> => {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, type, dayId, start_time, end_time, image_url")
    .eq("organizer_id", userId)
    .eq("is_last_year_event", false)
    .eq("event_day_out", false)
    .order("dayId")
    .order("start_time");

  if (error) {
    console.error("getParticipantEventsSummary:", error);
    return [];
  }

  if (!events?.length) {
    return [];
  }

  const dayIds = [...new Set(events.map((event) => event.dayId).filter(Boolean))];

  const { data: eventDays, error: daysError } = await supabase
    .from("events_days")
    .select("dayId, label")
    .in("dayId", dayIds);

  if (daysError) {
    console.error("getParticipantEventsSummary events_days:", daysError);
  }

  const dayLabelById = new Map(
    (eventDays ?? []).map((day) => [day.dayId, day.label as string])
  );

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    type: event.type,
    dayId: event.dayId,
    dayLabel: dayLabelById.get(event.dayId) ?? null,
    start_time: event.start_time,
    end_time: event.end_time,
    image_url: event.image_url ?? null,
  }));
};
