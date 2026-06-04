import type { SupabaseClient } from "@supabase/supabase-js";
import { buildMapLocations } from "@/lib/map/build-map-locations";
import type { TourStatus } from "@/lib/participants/exhibitor-visibility";
import type { EventType } from "@/schemas/eventSchemas";
import type { ProgramListItem } from "./program-types";
import {
  buildLocationBadgeIndex,
  organizerBadgeFromParticipant,
  resolveOrganizerBadge,
} from "./resolve-program-organizer-badge";
import {
  buildEventDaysMap,
  getCurrentTourStatus,
  organizerBadgeFieldsFromEmbed,
  slugFromEmbed,
} from "./program-utils";

type OrganizerEmbed = {
  user_id: string;
  user_name: string;
  participant_details: unknown;
};

type RawEventRow = {
  id: string;
  title: string;
  image_url: string | null;
  type: string | null;
  dayId: string | null;
  start_time: string | null;
  end_time: string | null;
  location_id: string | null;
  co_organizers: string[] | null;
  organizer: OrganizerEmbed | OrganizerEmbed[] | null;
};

const normalizeOrganizer = (
  organizer: RawEventRow["organizer"]
): OrganizerEmbed | null => {
  if (!organizer) return null;
  if (Array.isArray(organizer)) return organizer[0] ?? null;
  return organizer;
};

type CoOrganizerRow = {
  user_id: string;
  user_name: string;
  participant_details: unknown;
};

export type LoadProgramEventsOptions = {
  type?: EventType;
  day?: string;
};

export const loadProgramListItems = async (
  supabase: SupabaseClient,
  options: LoadProgramEventsOptions = {}
): Promise<ProgramListItem[]> => {
  const currentTourStatus = await getCurrentTourStatus(supabase);

  let query = supabase.from("events").select(`
    id,
    title,
    image_url,
    type,
    dayId,
    start_time,
    end_time,
    location_id,
    co_organizers,
    organizer:user_info!organizer_id (
      user_id,
      user_name,
      participant_details (
        slug,
        special_program,
        display_number
      )
    )
  `);

  if (options.type) {
    query = query.ilike("type", options.type);
  }

  if (options.day) {
    query = query.eq("dayId", options.day);
  }

  query = query.eq("event_day_out", false);

  if (currentTourStatus === "new") {
    query = query.eq("is_last_year_event", false);
  } else if (currentTourStatus === "older") {
    query = query.eq("is_last_year_event", true);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Error fetching program events:", error);
    throw new Error(error.message);
  }

  const rows = (events ?? []) as unknown as RawEventRow[];

  const uniqueDayIds = [
    ...new Set(
      rows.map((e) => e.dayId).filter((id): id is string => Boolean(id && id !== "day-off"))
    ),
  ];

  const eventDaysMap = await buildEventDaysMap(
    supabase,
    currentTourStatus,
    uniqueDayIds
  );

  const validEvents = rows.filter(
    (event) =>
      event.dayId &&
      event.dayId !== "day-off" &&
      eventDaysMap.has(event.dayId)
  );

  const tourStatus: TourStatus =
    currentTourStatus === "older" ? "older" : "new";
  const locations = await buildMapLocations(supabase, tourStatus);
  const badgeByLocationId = buildLocationBadgeIndex(locations);

  const allCoIds = [
    ...new Set(
      validEvents.flatMap((event) => event.co_organizers ?? []).filter(Boolean)
    ),
  ];

  let coOrganizerMap = new Map<string, CoOrganizerRow>();

  if (allCoIds.length > 0) {
    const { data: coOrganizers, error: coError } = await supabase
      .from("user_info")
      .select(
        `
          user_id,
          user_name,
          participant_details (
            slug
          )
        `
      )
      .in("user_id", allCoIds);

    if (coError) {
      console.error("Error fetching co-organizers:", coError);
    } else {
      coOrganizerMap = new Map(
        (coOrganizers ?? []).map((co) => [co.user_id, co as CoOrganizerRow])
      );
    }
  }

  return validEvents.map((event) => {
    const dayMeta = eventDaysMap.get(event.dayId!)!;
    const coIds = event.co_organizers ?? [];
    const organizer = normalizeOrganizer(event.organizer);
    const participantDetails = organizer?.participant_details as Parameters<
      typeof organizerBadgeFieldsFromEmbed
    >[0];
    const { specialProgram, displayNumber } =
      organizerBadgeFieldsFromEmbed(participantDetails);
    const organizerFallback = organizerBadgeFromParticipant(
      specialProgram,
      displayNumber
    );
    const badge = resolveOrganizerBadge(
      event.location_id,
      badgeByLocationId,
      organizerFallback
    );

    return {
      eventId: event.id,
      name: event.title,
      eventImg: event.image_url || "",
      date: {
        dayId: event.dayId!,
        label: dayMeta.label,
        date: dayMeta.date,
      },
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      type: (event.type || "Other") as EventType,
      organizer: {
        userId: organizer?.user_id || "",
        userName: organizer?.user_name || "Unknown",
        slug: slugFromEmbed(
          organizer?.participant_details as Parameters<typeof slugFromEmbed>[0]
        ),
        type: badge.type,
        displayNumber: badge.displayNumber,
      },
      coOrganizers: coIds
        .map((id) => coOrganizerMap.get(id))
        .filter((co): co is CoOrganizerRow => Boolean(co))
        .map((co) => ({
          userId: co.user_id,
          userName: co.user_name,
          slug: slugFromEmbed(
            co.participant_details as Parameters<typeof slugFromEmbed>[0]
          ),
        })),
    };
  });
};
