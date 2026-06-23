import { resolveVisitorNameFields } from "@/lib/visitor/map-visitor-row-to-profile";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AttendanceReportScope = "event" | "location-day";
export type AttendanceReportScopeFilter = AttendanceReportScope | "all";

export type AttendanceReportFilters = {
  scope?: AttendanceReportScopeFilter;
  eventId?: string | null;
  dayId?: string | null;
  locationId?: string | null;
};

export type AttendanceReportRow = {
  id: string;
  scope: AttendanceReportScope;
  visitorId: string;
  visitorName: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  areaName: string;
  scannedAt: string;
  eventId: string | null;
  eventTitle: string | null;
  eventType: string | null;
  dayId: string | null;
  dayLabel: string | null;
  dayDate: string | null;
  locationId: string | null;
  locationName: string | null;
  locationAddress: string | null;
  scannedByUserId: string | null;
};

export type AttendanceReportSummary = {
  totalCheckIns: number;
  uniqueVisitors: number;
  eventCount: number;
  locationDayCount: number;
  generatedAt: string;
};

export type AttendanceReportData = {
  rows: AttendanceReportRow[];
  summary: AttendanceReportSummary;
};

export type AttendanceReportOption = {
  id: string;
  label: string;
};

export type AttendanceReportOptions = {
  events: AttendanceReportOption[];
  days: AttendanceReportOption[];
  locations: AttendanceReportOption[];
};

type EventAttendanceRow = {
  id: string;
  visitor_id: string;
  event_id: string;
  scanned_at: string;
};

type LocationDayAttendanceRow = {
  id: string;
  visitor_id: string;
  day_id: string;
  location_id: string;
  scanned_by_user_id: string | null;
  scanned_at: string;
};

type VisitorRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
  birth_date: string | null;
  area_id: string | null;
};

type VisitorAreaRow = {
  id: string;
  name: string | null;
};

type EventMetaRow = {
  id: string;
  title: string | null;
  type: string | null;
  dayId: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location_id: string | null;
  location?: LocationMetaRow | LocationMetaRow[] | null;
};

type DayMetaRow = {
  dayId: string;
  label: string | null;
  date: string | null;
};

type LocationMetaRow = {
  id: string;
  display_name?: string | null;
  formatted_address: string | null;
};

const uniqueValues = (values: Array<string | null | undefined>): string[] => [
  ...new Set(values.filter((value): value is string => Boolean(value))),
];

const getVisitorName = (visitor: VisitorRow | undefined, visitorId: string) => {
  if (!visitor) {
    return {
      firstName: "",
      lastName: "",
      visitorName: "Unknown visitor",
      email: "",
      birthDate: "",
      areaId: "",
    };
  }

  const { firstName, lastName } = resolveVisitorNameFields(visitor);
  const visitorName =
    visitor.display_name?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    visitor.full_name?.trim() ||
    visitor.email?.trim() ||
    visitor.id;

  return {
    firstName,
    lastName,
    visitorName,
    email: visitor.email?.trim() ?? "",
    birthDate: visitor.birth_date?.trim() ?? "",
    areaId: visitor.area_id?.trim() ?? "",
  };
};

const getEventRowsForFilters = async (
  supabase: SupabaseClient,
  filters: AttendanceReportFilters,
): Promise<EventAttendanceRow[]> => {
  if (filters.scope === "location-day") return [];

  let filteredEventIds: string[] | null = null;
  if ((filters.dayId || filters.locationId) && !filters.eventId) {
    let eventsQuery = supabase
      .from("events")
      .select("id");

    if (filters.dayId) {
      eventsQuery = eventsQuery.eq("dayId", filters.dayId);
    }

    if (filters.locationId) {
      eventsQuery = eventsQuery.eq("location_id", filters.locationId);
    }

    const { data: filteredEvents, error: filteredEventsError } = await eventsQuery;
    if (filteredEventsError) {
      console.error("getAttendanceReportData filteredEvents:", filteredEventsError);
      return [];
    }

    filteredEventIds = uniqueValues((filteredEvents ?? []).map((event) => event.id as string));
    if (filteredEventIds.length === 0) return [];
  }

  let query = supabase
    .from("event_attendance")
    .select("id, visitor_id, event_id, scanned_at")
    .order("scanned_at", { ascending: true });

  if (filters.eventId) {
    query = query.eq("event_id", filters.eventId);
  } else if (filteredEventIds) {
    query = query.in("event_id", filteredEventIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getAttendanceReportData event_attendance:", error);
    return [];
  }

  return (data ?? []) as EventAttendanceRow[];
};

const getLocationDayRowsForFilters = async (
  supabase: SupabaseClient,
  filters: AttendanceReportFilters,
): Promise<LocationDayAttendanceRow[]> => {
  if (filters.scope === "event") return [];

  let query = supabase
    .from("location_day_attendance")
    .select("id, visitor_id, day_id, location_id, scanned_by_user_id, scanned_at")
    .order("scanned_at", { ascending: true });

  if (filters.locationId) {
    query = query.eq("location_id", filters.locationId);
  }

  if (filters.dayId) {
    query = query.eq("day_id", filters.dayId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getAttendanceReportData location_day_attendance:", error);
    return [];
  }

  return (data ?? []) as LocationDayAttendanceRow[];
};

const getVisitorsById = async (
  supabase: SupabaseClient,
  visitorIds: string[],
): Promise<Map<string, VisitorRow>> => {
  if (visitorIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("visitor_data")
    .select("id, email, first_name, last_name, full_name, display_name, birth_date, area_id")
    .in("id", visitorIds);

  if (error) {
    console.error("getAttendanceReportData visitor_data:", error);
    return new Map();
  }

  return new Map(((data ?? []) as VisitorRow[]).map((visitor) => [visitor.id, visitor]));
};

const getAreasById = async (
  supabase: SupabaseClient,
  areaIds: string[],
): Promise<Map<string, string>> => {
  if (areaIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("visitor_areas")
    .select("id, name")
    .in("id", areaIds);

  if (error) {
    console.error("getAttendanceReportData visitor_areas:", error);
    return new Map();
  }

  return new Map(
    ((data ?? []) as VisitorAreaRow[]).map((area) => [
      area.id,
      area.name?.trim() || "No area",
    ]),
  );
};

const getEventsById = async (
  supabase: SupabaseClient,
  eventIds: string[],
): Promise<Map<string, EventMetaRow>> => {
  if (eventIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
        id,
        title,
        type,
        dayId,
        start_time,
        end_time,
        location_id,
        location:map_info!location_id (
          id,
          formatted_address
        )
      `,
    )
    .in("id", eventIds);

  if (error) {
    console.error("getAttendanceReportData events:", error);
    return new Map();
  }

  return new Map(((data ?? []) as EventMetaRow[]).map((event) => [event.id, event]));
};

const normalizeEventLocation = (
  event: EventMetaRow | undefined,
  locationsById: Map<string, LocationMetaRow>,
): LocationMetaRow | undefined => {
  const embeddedLocation = Array.isArray(event?.location)
    ? event.location[0]
    : event?.location;

  if (embeddedLocation) return embeddedLocation;
  if (!event?.location_id) return undefined;

  return locationsById.get(event.location_id);
};

const getFriendlyLocationName = (location: LocationMetaRow | undefined): string =>
  location?.formatted_address?.trim() ||
  location?.display_name?.trim() ||
  "Unknown venue";

const getFriendlyLocationAddress = (
  location: LocationMetaRow | undefined,
): string | null =>
  location?.formatted_address?.trim() ||
  null;

const getDaysById = async (
  supabase: SupabaseClient,
  dayIds: string[],
): Promise<Map<string, DayMetaRow>> => {
  if (dayIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("events_days")
    .select("dayId, label, date")
    .in("dayId", dayIds);

  if (error) {
    console.error("getAttendanceReportData events_days:", error);
    return new Map();
  }

  return new Map(((data ?? []) as DayMetaRow[]).map((day) => [day.dayId, day]));
};

const getLocationsById = async (
  supabase: SupabaseClient,
  locationIds: string[],
): Promise<Map<string, LocationMetaRow>> => {
  if (locationIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("map_info")
    .select("id, formatted_address")
    .in("id", locationIds);

  if (error) {
    console.error("getAttendanceReportData map_info:", error);
    return new Map();
  }

  return new Map(((data ?? []) as LocationMetaRow[]).map((location) => [location.id, location]));
};

const buildSummary = (rows: AttendanceReportRow[]): AttendanceReportSummary => ({
  totalCheckIns: rows.length,
  uniqueVisitors: new Set(rows.map((row) => row.visitorId)).size,
  eventCount: new Set(
    rows
      .filter((row) => row.scope === "event")
      .map((row) => row.eventId)
      .filter(Boolean),
  ).size,
  locationDayCount: new Set(
    rows
      .filter((row) => row.scope === "location-day")
      .map((row) => `${row.locationId ?? ""}:${row.dayId ?? ""}`),
  ).size,
  generatedAt: new Date().toISOString(),
});

export const getAttendanceReportData = async (
  supabase: SupabaseClient,
  filters: AttendanceReportFilters = {},
): Promise<AttendanceReportData> => {
  const normalizedFilters: AttendanceReportFilters = {
    scope: filters.scope ?? "all",
    eventId: filters.eventId?.trim() || null,
    dayId: filters.dayId?.trim() || null,
    locationId: filters.locationId?.trim() || null,
  };

  const [eventRows, locationDayRows] = await Promise.all([
    getEventRowsForFilters(supabase, normalizedFilters),
    getLocationDayRowsForFilters(supabase, normalizedFilters),
  ]);

  const eventIds = uniqueValues([
    normalizedFilters.eventId,
    ...eventRows.map((row) => row.event_id),
  ]);
  const eventMetaById = await getEventsById(supabase, eventIds);
  const dayIds = uniqueValues([
    normalizedFilters.dayId,
    ...locationDayRows.map((row) => row.day_id),
    ...[...eventMetaById.values()].map((event) => event.dayId),
  ]);
  const locationIds = uniqueValues([
    normalizedFilters.locationId,
    ...locationDayRows.map((row) => row.location_id),
    ...[...eventMetaById.values()].map((event) => event.location_id),
  ]);

  const visitorsById = await getVisitorsById(
    supabase,
    uniqueValues([
      ...eventRows.map((row) => row.visitor_id),
      ...locationDayRows.map((row) => row.visitor_id),
    ]),
  );

  const [areasById, daysById, locationsById] = await Promise.all([
    getAreasById(
      supabase,
      uniqueValues([...visitorsById.values()].map((visitor) => visitor.area_id)),
    ),
    getDaysById(supabase, dayIds),
    getLocationsById(supabase, locationIds),
  ]);

  const eventReportRows: AttendanceReportRow[] = eventRows.map((row) => {
    const event = eventMetaById.get(row.event_id);
    const day = event?.dayId ? daysById.get(event.dayId) : undefined;
    const location = normalizeEventLocation(event, locationsById);
    const visitor = getVisitorName(visitorsById.get(row.visitor_id), row.visitor_id);

    return {
      id: row.id,
      scope: "event",
      visitorId: row.visitor_id,
      visitorName: visitor.visitorName,
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      email: visitor.email,
      birthDate: visitor.birthDate,
      areaName: visitor.areaId ? areasById.get(visitor.areaId) ?? "No area" : "No area",
      scannedAt: row.scanned_at,
      eventId: row.event_id,
      eventTitle: event?.title ?? "Unknown event",
      eventType: event?.type ?? null,
      dayId: event?.dayId ?? null,
      dayLabel: day?.label ?? null,
      dayDate: day?.date ?? null,
      locationId: event?.location_id ?? null,
      locationName: getFriendlyLocationName(location),
      locationAddress: getFriendlyLocationAddress(location),
      scannedByUserId: null,
    };
  });

  const locationDayReportRows: AttendanceReportRow[] = locationDayRows.map((row) => {
    const day = daysById.get(row.day_id);
    const location = locationsById.get(row.location_id);
    const visitor = getVisitorName(visitorsById.get(row.visitor_id), row.visitor_id);

    return {
      id: row.id,
      scope: "location-day",
      visitorId: row.visitor_id,
      visitorName: visitor.visitorName,
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      email: visitor.email,
      birthDate: visitor.birthDate,
      areaName: visitor.areaId ? areasById.get(visitor.areaId) ?? "No area" : "No area",
      scannedAt: row.scanned_at,
      eventId: null,
      eventTitle: null,
      eventType: null,
      dayId: row.day_id,
      dayLabel: day?.label ?? "Unknown day",
      dayDate: day?.date ?? null,
      locationId: row.location_id,
      locationName: getFriendlyLocationName(location),
      locationAddress: getFriendlyLocationAddress(location),
      scannedByUserId: row.scanned_by_user_id,
    };
  });

  const rows = [...eventReportRows, ...locationDayReportRows].sort((a, b) =>
    a.scannedAt.localeCompare(b.scannedAt),
  );

  return {
    rows,
    summary: buildSummary(rows),
  };
};

export const getAttendanceReportOptions = async (
  supabase: SupabaseClient,
): Promise<AttendanceReportOptions> => {
  const [eventsResult, daysResult, locationsResult] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, dayId")
      .eq("is_last_year_event", false)
      .eq("event_day_out", false)
      .order("dayId")
      .order("title"),
    supabase.from("events_days").select("dayId, label, date").order("dayId"),
    supabase.from("map_info").select("id, formatted_address").order("formatted_address"),
  ]);

  if (eventsResult.error) {
    console.error("getAttendanceReportOptions events:", eventsResult.error);
  }
  if (daysResult.error) {
    console.error("getAttendanceReportOptions events_days:", daysResult.error);
  }
  if (locationsResult.error) {
    console.error("getAttendanceReportOptions map_info:", locationsResult.error);
  }

  return {
    events: ((eventsResult.data ?? []) as Array<{ id: string; title: string | null; dayId: string | null }>).map(
      (event) => ({
        id: event.id,
        label: event.dayId ? `${event.title ?? event.id} (${event.dayId})` : event.title ?? event.id,
      }),
    ),
    days: ((daysResult.data ?? []) as DayMetaRow[]).map((day) => ({
      id: day.dayId,
      label: day.label ?? day.dayId,
    })),
    locations: ((locationsResult.data ?? []) as LocationMetaRow[]).map((location) => ({
      id: location.id,
      label: location.formatted_address ?? location.id,
    })),
  };
};
