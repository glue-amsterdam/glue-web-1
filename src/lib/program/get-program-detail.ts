import type { SupabaseClient } from "@supabase/supabase-js";
import { toMediaUrl } from "@/lib/media/media-url";
import { toBaseFormattedAddress } from "@/lib/map/to-base-formatted-address";
import {
  loadOrganizerProfiles,
  type OrganizerProfile,
} from "@/lib/participants/load-organizer-profiles";
import { getTheme } from "@/lib/theme";
import type { TourStatus } from "@/lib/participants/exhibitor-visibility";
import type { EventType } from "@/schemas/eventSchemas";
import type { ProgramDetail } from "./program-types";
import { ProgramNotFoundError } from "./program-types";
import {
  loadInheritedHubInputsByUserId,
  organizerBadgeFromParticipant,
  resolveLocationOrganizerBadge,
} from "./resolve-program-organizer-badge";
import {
  getCurrentTourStatus,
  getEventDayForDetail,
  organizerBadgeFieldsFromEmbed,
  slugFromEmbed,
} from "./program-utils";
import {
  fetchTourSnapshotRow,
  getProgramDetailFromSnapshot,
} from "@/lib/tour/read-tour-snapshots";

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

export type GetProgramDetailOptions = {
  /** Skip reading previous_tour_program (used when building/repairing snapshots). */
  bypassSnapshot?: boolean;
  /** Force which events flag to query, independent of tour_status. */
  eventSource?: "current" | "last_year";
};

export const getProgramDetail = async (
  supabase: SupabaseClient,
  eventId: string,
  options: GetProgramDetailOptions = {}
): Promise<ProgramDetail> => {
  const currentTourStatus = await getCurrentTourStatus(supabase);

  if (!options.bypassSnapshot && currentTourStatus === "older") {
    const snapshotRow = await fetchTourSnapshotRow(supabase);
    const snapshotted = getProgramDetailFromSnapshot(
      snapshotRow?.previous_tour_program,
      eventId
    );
    if (snapshotted) {
      return snapshotted;
    }
    console.warn(
      "Tour is older but program detail snapshot is missing; falling back to live last-year event."
    );
  }

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
        organizer_id,
        rsvp,
        rsvp_link,
        event_day_out,
        location:map_info!location_id (
          id,
          formatted_address
        )
      `
    )
    .eq("id", eventId)
    .eq("event_day_out", false);

  const eventSource =
    options.eventSource ??
    (currentTourStatus === "older" ? "last_year" : "current");

  if (eventSource === "current") {
    eventQuery = eventQuery.eq("is_last_year_event", false);
  } else {
    eventQuery = eventQuery.eq("is_last_year_event", true);
  }

  const { data: event, error: eventError } = await eventQuery.single();

  if (eventError || !event) {
    throw new ProgramNotFoundError();
  }

  if (event.event_day_out || event.dayId === "day-off" || !event.dayId) {
    throw new ProgramNotFoundError();
  }

  const organizerUserIds = [
    ...(event.organizer_id ? [event.organizer_id] : []),
    ...(event.co_organizers ?? []),
  ];

  const [organizerProfiles, eventDay, { participantCategories: categories }] =
    await Promise.all([
      loadOrganizerProfiles(supabase, organizerUserIds),
      getEventDayForDetail(supabase, currentTourStatus, event.dayId),
      getTheme(),
    ]);

  if (!eventDay) {
    throw new ProgramNotFoundError();
  }

  const organizer = event.organizer_id
    ? organizerProfiles.get(event.organizer_id)
    : undefined;

  const tourStatus: TourStatus =
    currentTourStatus === "older" ? "older" : "new";

  const participantDetails = organizer?.participant_details as Parameters<
    typeof organizerBadgeFieldsFromEmbed
  >[0];
  const { category, displayNumber } =
    organizerBadgeFieldsFromEmbed(participantDetails);
  const inheritedHubsByOrganizerId = organizer?.user_id
    ? await loadInheritedHubInputsByUserId(
        supabase,
        [organizer.user_id],
        tourStatus,
        categories
      )
    : new Map();
  const organizerFallback = organizerBadgeFromParticipant(
    category,
    displayNumber,
    categories,
    {
      hubs: organizer?.user_id
        ? (inheritedHubsByOrganizerId.get(organizer.user_id) ?? [])
        : [],
    }
  );
  const badge = await resolveLocationOrganizerBadge(
    supabase,
    event.location_id,
    tourStatus,
    organizerFallback
  );

  const detail: ProgramDetail = {
    eventId: event.id,
    name: event.title,
    eventImg: toMediaUrl(event.image_url) || "",
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
    coOrganizers: ((event.co_organizers ?? []) as string[])
      .map((userId) => organizerProfiles.get(userId))
      .filter((co): co is OrganizerProfile => Boolean(co))
      .map((co) => ({
        userId: co.user_id,
        userName: co.user_name,
        slug: slugFromEmbed(co.participant_details),
      })),
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
