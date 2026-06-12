import { getHubHostContext } from "@/lib/hubs/get-hub-host-context";
import type { ScannableEventRow } from "@/lib/scan/is-event-scan-allowed";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EventDayForScan = {
  dayId: string;
  label: string;
  date: string | null;
};

export type QrScanPageData = {
  eventDays: EventDayForScan[];
  events: ScannableEventRow[];
  hubHost: {
    isHubHost: boolean;
    hostedLocationIds: string[];
  };
  eventAttendanceCounts: Record<string, number>;
  locationDayCounts: Record<string, number>;
};

export const getScannableEvents = async (
  supabase: SupabaseClient,
  userId: string,
  hostedLocationIds: string[],
): Promise<ScannableEventRow[]> => {
  const { data: ownEvents, error: ownEventsError } = await supabase
    .from("events")
    .select(
      "id, title, type, dayId, start_time, end_time, location_id, organizer_id",
    )
    .eq("organizer_id", userId)
    .eq("is_last_year_event", false)
    .eq("event_day_out", false)
    .order("dayId")
    .order("start_time");

  if (ownEventsError) {
    console.error("getScannableEvents own:", ownEventsError);
  }

  let locationEvents: ScannableEventRow[] = [];
  if (hostedLocationIds.length > 0) {
    const { data: hostLocationEvents, error: hostLocationEventsError } =
      await supabase
        .from("events")
        .select(
          "id, title, type, dayId, start_time, end_time, location_id, organizer_id",
        )
        .in("location_id", hostedLocationIds)
        .eq("is_last_year_event", false)
        .eq("event_day_out", false)
        .order("dayId")
        .order("start_time");

    if (hostLocationEventsError) {
      console.error("getScannableEvents host location:", hostLocationEventsError);
    } else {
      locationEvents = (hostLocationEvents ?? []) as ScannableEventRow[];
    }
  }

  const merged = new Map<string, ScannableEventRow>();
  for (const event of [...(ownEvents ?? []), ...locationEvents] as ScannableEventRow[]) {
    merged.set(event.id, event);
  }

  return [...merged.values()].filter((event) => event.dayId && event.dayId !== "day-off");
};

export const getEventDaysForScan = async (
  supabase: SupabaseClient,
): Promise<EventDayForScan[]> => {
  const { data: eventDays, error } = await supabase
    .from("events_days")
    .select("dayId, label, date")
    .order("dayId");

  if (error) {
    console.error("getEventDaysForScan:", error);
    return [];
  }

  return (eventDays ?? []).map((day) => ({
    dayId: day.dayId as string,
    label: day.label as string,
    date: (day.date as string | null) ?? null,
  }));
};

export const getEventAttendanceCounts = async (
  supabase: SupabaseClient,
  eventIds: string[],
): Promise<Record<string, number>> => {
  if (eventIds.length === 0) return {};

  const { data, error } = await supabase
    .from("event_attendance")
    .select("event_id")
    .in("event_id", eventIds);

  if (error) {
    console.error("getEventAttendanceCounts:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const eventId = row.event_id as string;
    counts[eventId] = (counts[eventId] ?? 0) + 1;
  }

  return counts;
};

export const getLocationDayCounts = async (
  supabase: SupabaseClient,
  locationIds: string[],
  dayIds: string[],
): Promise<Record<string, number>> => {
  if (locationIds.length === 0 || dayIds.length === 0) return {};

  const { data, error } = await supabase
    .from("location_day_attendance")
    .select("location_id, day_id")
    .in("location_id", locationIds)
    .in("day_id", dayIds);

  if (error) {
    console.error("getLocationDayCounts:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = `${row.location_id as string}:${row.day_id as string}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
};

export const getQrScanPageData = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<QrScanPageData> => {
  const hubHost = await getHubHostContext(supabase, userId);
  const [eventDays, events] = await Promise.all([
    getEventDaysForScan(supabase),
    getScannableEvents(supabase, userId, hubHost.hostedLocationIds),
  ]);

  const eventIds = events.map((event) => event.id);
  const dayIds = [...new Set(events.map((event) => event.dayId))];

  const [eventAttendanceCounts, locationDayCounts] = await Promise.all([
    getEventAttendanceCounts(supabase, eventIds),
    getLocationDayCounts(supabase, hubHost.hostedLocationIds, dayIds),
  ]);

  return {
    eventDays,
    events,
    hubHost: {
      isHubHost: hubHost.isHubHost,
      hostedLocationIds: hubHost.hostedLocationIds,
    },
    eventAttendanceCounts,
    locationDayCounts,
  };
};
