import type { OpenCloseTime } from "@/types/api-visible-user";
import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyLocationType } from "@/lib/map/classify-location-type";
import {
  classifyHubMemberCategory,
  type ParticipantCategory,
} from "@/lib/participants/participant-categories";
import { getTheme } from "@/lib/theme";
import { getParticipantInheritedHubs } from "@/lib/numbers/get-participant-inherited-hubs";
import type { InheritedHubOption } from "@/lib/numbers/pick-inherited-hub";
import type { ExhibitorType } from "./exhibitor-types";
import {
  ExhibitorNotFoundError,
  type ExhibitorContactInfo,
  type ExhibitorMapInfo,
  type ExhibitorParticipantDetail,
  type ExhibitorSocialMedia,
} from "./exhibitor-detail-types";
import { resolveExhibitorDetailNavigation } from "./exhibitor-detail-navigation";
import {
  getTourStatus,
  getStickyParticipantIds,
  isParticipantEligibleForExhibitorsList,
  isParticipantPubliclyVisible,
  isParticipantSticky,
  type TourStatus,
} from "./exhibitor-visibility";
import { participantImagesToCarouselSlides } from "./exhibitor-carousel-slides";
import { toBaseFormattedAddress } from "@/lib/map/to-base-formatted-address";
import { getParticipantDisplayName } from "./get-participant-display-name";
import { getParticipantPlaceholderUrl } from "./get-participant-placeholder-url";

type ParticipantRow = {
  user_id: string;
  slug: string;
  category: string;
  display_number: string | null;
  short_description: string | null;
  description: string | null;
  status: string;
  is_active: boolean;
  was_active_last_year: boolean;
  display_name: string | null;
  show_hub_number?: boolean | null;
  phone_numbers: string[] | null;
  social_media: ExhibitorSocialMedia | Record<string, string> | null;
  visible_emails: string[] | null;
  visible_websites: string[] | null;
};

type HubMembership = {
  hubHostUserId: string;
  memberCount: number;
};

type HubParticipantRow = { user_id: string };

type HubRow = {
  hub_host_id: string;
  hub_participants: HubParticipantRow | HubParticipantRow[] | null;
};

const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const getParticipantTypeFromMembership = (
  membership: HubMembership | null,
  category: string,
  categories: ParticipantCategory[]
): ExhibitorType => {
  if (membership) {
    return classifyHubMemberCategory(
      membership.memberCount,
      category,
      categories
    );
  }

  return classifyLocationType(1, category, categories);
};

const normalizeSocialMedia = (
  socialMedia: ParticipantRow["social_media"]
): ExhibitorSocialMedia | null => {
  if (!socialMedia || typeof socialMedia !== "object") {
    return null;
  }

  const media = socialMedia as ExhibitorSocialMedia;
  if (
    !media.instagramLink &&
    !media.facebookLink &&
    !media.linkedinLink
  ) {
    return null;
  }

  return media;
};

const resolveHubMembership = async (
  supabase: SupabaseClient,
  userId: string
): Promise<HubMembership | null> => {
  const { data: hostedHub, error: hostedHubError } = await supabase
    .from("hubs")
    .select(
      `
        hub_host_id,
        hub_participants (
          user_id
        )
      `
    )
    .eq("hub_host_id", userId)
    .limit(1)
    .maybeSingle();

  if (hostedHubError) {
    console.error("Error fetching hosted hub:", hostedHubError);
  }

  let hub = hostedHub as HubRow | null;

  if (!hub) {
    const { data: membership, error: membershipError } = await supabase
      .from("hub_participants")
      .select("hub_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error("Error fetching hub membership:", membershipError);
      return null;
    }

    if (!membership?.hub_id) {
      return null;
    }

    const { data: memberHub, error: hubError } = await supabase
      .from("hubs")
      .select(
        `
          hub_host_id,
          hub_participants (
            user_id
          )
        `
      )
      .eq("id", membership.hub_id)
      .maybeSingle();

    if (hubError) {
      console.error("Error fetching hub host for member:", hubError);
      return null;
    }

    hub = memberHub as HubRow | null;
  }

  if (!hub?.hub_host_id) {
    return null;
  }

  const memberUserIds = new Set<string>([hub.hub_host_id]);
  for (const participant of ensureArray(hub.hub_participants)) {
    memberUserIds.add(participant.user_id);
  }

  const [stickyIds, tourStatus] = await Promise.all([
    getStickyParticipantIds(supabase),
    getTourStatus(supabase),
  ]);

  const { data: memberRows, error: memberError } = await supabase
    .from("participant_details")
    .select("user_id, is_active, was_active_last_year, status")
    .in("user_id", Array.from(memberUserIds))
    .eq("status", "accepted");

  if (memberError) {
    console.error("Error fetching hub member eligibility:", memberError);
    return null;
  }

  const memberCount = (memberRows ?? []).filter((member) =>
    isParticipantEligibleForExhibitorsList(member, stickyIds, tourStatus)
  ).length;

  if (memberCount === 0) {
    return null;
  }

  return {
    hubHostUserId: hub.hub_host_id,
    memberCount,
  };
};

const resolveHubHostMapLocations = async (
  supabase: SupabaseClient,
  inheritedHubs: InheritedHubOption[],
  tourStatus: TourStatus
): Promise<ExhibitorMapInfo[]> => {
  const hubHostUserIds = [
    ...new Set(
      inheritedHubs
        .map((hub) => hub.hubHostUserId?.trim())
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (hubHostUserIds.length === 0) {
    return [];
  }

  const { data: hostParticipants, error: hostParticipantError } = await supabase
    .from("participant_details")
    .select("user_id, is_active, was_active_last_year, status")
    .in("user_id", hubHostUserIds);

  if (hostParticipantError) {
    console.error("Error fetching hub host participants:", hostParticipantError);
    return [];
  }

  const eligibleHostIds = new Set(
    (hostParticipants ?? [])
      .filter((host) =>
        isParticipantEligibleForExhibitorsList(host, new Set(), tourStatus)
      )
      .map((host) => host.user_id)
  );

  if (eligibleHostIds.size === 0) {
    return [];
  }

  const { data: hostMapInfoRows, error: hostMapInfoError } = await supabase
    .from("map_info")
    .select("id, user_id, formatted_address, no_address")
    .in("user_id", Array.from(eligibleHostIds));

  if (hostMapInfoError) {
    console.error("Error fetching hub host map info:", hostMapInfoError);
    return [];
  }

  const mapInfoByUserId = new Map(
    ((hostMapInfoRows as {
      id: string;
      user_id: string;
      formatted_address: string | null;
      no_address: boolean;
    }[]) ?? [])
      .filter((row) => row.id && !row.no_address)
      .map((row) => [row.user_id, row])
  );

  const locations: ExhibitorMapInfo[] = [];
  const seenIds = new Set<string>();

  for (const hostUserId of hubHostUserIds) {
    const row = mapInfoByUserId.get(hostUserId);
    if (!row || seenIds.has(row.id)) continue;

    const address = toBaseFormattedAddress(row.formatted_address);
    if (!address) continue;

    seenIds.add(row.id);
    locations.push({
      id: row.id,
      formatted_address: address,
      no_address: false,
    });
  }

  return locations;
};

const buildEventsQuery = (
  supabase: SupabaseClient,
  userId: string,
  tourStatus: TourStatus
) => {
  let query = supabase
    .from("events")
    .select("id, image_url, title")
    .eq("organizer_id", userId)
    .eq("event_day_out", false);

  if (tourStatus === "new") {
    return query.eq("is_last_year_event", false);
  }

  return query.eq("is_last_year_event", true);
};

const buildContactInfo = async (
  supabase: SupabaseClient,
  userId: string,
  participant: ParticipantRow,
  tourStatus: TourStatus,
  inheritedHubs: InheritedHubOption[]
): Promise<ExhibitorContactInfo> => {
  const [mapInfoResult, visitingHoursResult, eventsResult, hubLocations] =
    await Promise.all([
      supabase
        .from("map_info")
        .select("formatted_address, id, no_address")
        .eq("user_id", userId),
      supabase
        .from("visiting_hours")
        .select("day_id, hours")
        .eq("user_id", userId),
      buildEventsQuery(supabase, userId, tourStatus),
      resolveHubHostMapLocations(supabase, inheritedHubs, tourStatus),
    ]);

  const visitingHours =
    visitingHoursResult.data?.reduce(
      (acc, day) => {
        acc[day.day_id] = day.hours as OpenCloseTime[];
        return acc;
      },
      {} as Record<string, OpenCloseTime[]>
    ) ?? null;

  const hasVisitingHours =
    visitingHours !== null &&
    Object.values(visitingHours).some((times) => times.length > 0);

  const mapInfo = (mapInfoResult.data ?? []).map((map) => ({
    ...map,
    formatted_address: toBaseFormattedAddress(map.formatted_address),
  }));
  const firstHubLocation = hubLocations[0];

  return {
    mapInfo,
    hubLocations,
    hubHostAddress: firstHubLocation?.formatted_address ?? null,
    hubHostMapInfoId: firstHubLocation?.id ?? null,
    phoneNumbers: participant.phone_numbers,
    visibleEmails: participant.visible_emails,
    visibleWebsites: participant.visible_websites,
    socialMedia: normalizeSocialMedia(participant.social_media),
    visitingHours: hasVisitingHours ? visitingHours : null,
    events: eventsResult.data ?? [],
  };
};

export const getExhibitorBySlug = async (
  supabase: SupabaseClient,
  slug: string
): Promise<ExhibitorParticipantDetail> => {
  const { data, error } = await supabase
    .from("participant_details")
    .select(
      `
        user_id,
        slug,
        category,
        display_number,
        short_description,
        description,
        status,
        is_active,
        was_active_last_year,
        display_name,
        show_hub_number,
        phone_numbers,
        social_media,
        visible_emails,
        visible_websites
      `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new ExhibitorNotFoundError();
    }
    throw error;
  }

  if (!data?.user_id) {
    throw new ExhibitorNotFoundError();
  }

  const row = data as ParticipantRow;
  const [isSticky, tourStatus, categories, membership, placeholderUrl, inheritedHubs] =
    await Promise.all([
      isParticipantSticky(supabase, row.user_id),
      getTourStatus(supabase),
      getTheme().then((theme) => theme.participantCategories),
      resolveHubMembership(supabase, row.user_id),
      getParticipantPlaceholderUrl(supabase),
      getParticipantInheritedHubs(supabase, row.user_id),
    ]);

  if (row.status === "accepted" && !isSticky) {
    if (!isParticipantPubliclyVisible(row, tourStatus)) {
      throw new ExhibitorNotFoundError();
    }
  }

  const participantName = getParticipantDisplayName(row);
  const type = getParticipantTypeFromMembership(
    membership,
    row.category,
    categories
  );

  const [imageResult, contactInfo] = await Promise.all([
    supabase
      .from("participant_image")
      .select("id, image_url")
      .eq("user_id", row.user_id)
      .order("id", { ascending: true }),
    buildContactInfo(supabase, row.user_id, row, tourStatus, inheritedHubs),
  ]);

  const carouselSlides = participantImagesToCarouselSlides(
    row.user_id,
    participantName,
    (imageResult.data ?? []) as { id: string | number; image_url: string }[],
    placeholderUrl
  );
  const imageUrl = carouselSlides[0]?.imageUrl ?? placeholderUrl;
  const description = row.description?.trim() || null;

  const participantWithoutNavigation = {
    type,
    slug: row.slug,
    userId: row.user_id,
    name: participantName,
    imageUrl,
    carouselSlides,
    displayNumber: row.display_number,
    showHubNumber: row.show_hub_number ?? true,
    inheritedHubs: inheritedHubs.map((hub) => ({
      displayNumber: hub.displayNumber,
      type: hub.type,
    })),
    description,
    status: row.status,
    is_sticky: isSticky,
    is_active: row.is_active,
    was_active_last_year: row.was_active_last_year,
    contactInfo,
  };

  return {
    ...participantWithoutNavigation,
    navigation: resolveExhibitorDetailNavigation(
      participantWithoutNavigation,
      tourStatus
    ),
  };
};
