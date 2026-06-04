import type { SupabaseClient } from "@supabase/supabase-js";
import { buildMapLocations } from "@/lib/map/build-map-locations";
import { toBaseFormattedAddress } from "@/lib/map/to-base-formatted-address";
import type { TourStatus } from "@/lib/participants/exhibitor-visibility";
import type { EventType } from "@/schemas/eventSchemas";
import type { ProgramDetail } from "./program-types";
import { ProgramNotFoundError } from "./program-types";
import {
  buildLocationBadgeIndex,
  organizerBadgeFromParticipant,
  resolveOrganizerBadge,
} from "./resolve-program-organizer-badge";
import {
  getCurrentTourStatus,
  getEventDayForDetail,
  organizerBadgeFieldsFromEmbed,
  slugFromEmbed,
} from "./program-utils";

type OrganizerEmbed = {
  user_id: string;
  user_name: string;
  participant_details: unknown;
};

type LocationEmbed = {
  id: string;
  formatted_address: string | null;
};

const normalizeLocation = (
  location: LocationEmbed | LocationEmbed[] | null | undefined
): LocationEmbed | null => {
  if (!location) return null;
  if (Array.isArray(location)) return location[0] ?? null;
  return location;
};

const normalizeOrganizer = (
  organizer: OrganizerEmbed | OrganizerEmbed[] | null | undefined
): OrganizerEmbed | null => {
  if (!organizer) return null;
  if (Array.isArray(organizer)) return organizer[0] ?? null;
  return organizer;
};

export const getProgramDetail = async (
  supabase: SupabaseClient,
  eventId: string
): Promise<ProgramDetail> => {
  const currentTourStatus = await getCurrentTourStatus(supabase);

  let eventQuery = supabase
    .from("events")
    .select(
      `
        id,
        title,
        description,
        image_url,
        type,
        dayId,
        start_time,
        end_time,
        co_organizers,
        location_id,
        rsvp,
        rsvp_link,
        event_day_out,
        organizer:user_info!organizer_id (
          user_id,
          user_name,
          participant_details (
            slug,
            special_program,
            display_number
          )
        ),
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

  if (eventError || !event) {
    throw new ProgramNotFoundError();
  }

  if (event.event_day_out || event.dayId === "day-off" || !event.dayId) {
    throw new ProgramNotFoundError();
  }

  const eventDay = await getEventDayForDetail(
    supabase,
    currentTourStatus,
    event.dayId
  );

  if (!eventDay) {
    throw new ProgramNotFoundError();
  }

  const { data: coOrganizers, error: coOrganizerError } = await supabase
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
    .in("user_id", event.co_organizers || []);

  if (coOrganizerError) {
    console.error("Error fetching co-organizers:", coOrganizerError);
    throw new Error(coOrganizerError.message);
  }

  const organizer = normalizeOrganizer(
    event.organizer as OrganizerEmbed | OrganizerEmbed[] | null
  );

  const tourStatus: TourStatus =
    currentTourStatus === "older" ? "older" : "new";
  const locations = await buildMapLocations(supabase, tourStatus);
  const badgeByLocationId = buildLocationBadgeIndex(locations);

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

  const detail: ProgramDetail = {
    eventId: event.id,
    name: event.title,
    eventImg: event.image_url || "",
    description: event.description || "",
    type: (event.type || "Other") as EventType,
    date: {
      dayId: event.dayId,
      label: eventDay.label,
      date: eventDay.date,
    },
    startTime: event.start_time || "",
    endTime: event.end_time || "",
    organizer: {
      userId: organizer?.user_id || "",
      userName: organizer?.user_name || "Unknown",
      slug: slugFromEmbed(
        organizer?.participant_details as Parameters<typeof slugFromEmbed>[0]
      ),
      type: badge.type,
      displayNumber: badge.displayNumber,
    },
    coOrganizers:
      coOrganizers?.map((co) => ({
        userId: co.user_id || "",
        userName: co.user_name || "Unknown",
        slug: slugFromEmbed(co.participant_details),
      })) ?? [],
    rsvp: event.rsvp ?? false,
  };

  if (detail.rsvp && event.rsvp_link) {
    detail.rsvpLink = event.rsvp_link;
  }

  const location = normalizeLocation(
    event.location as LocationEmbed | LocationEmbed[] | null
  );
  if (location?.id) {
    const formattedAddress = toBaseFormattedAddress(
      location.formatted_address ?? ""
    );
    if (formattedAddress) {
      detail.location = {
        id: location.id,
        formattedAddress,
      };
    }
  }

  return detail;
};
