import type { OpenCloseTime } from "@/types/api-visible-user";
import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyLocationType } from "@/lib/map/classify-location-type";
import {
  classifyHubMemberCategory,
  fetchParticipantCategories,
} from "@/lib/participants/participant-categories";
import type { ExhibitorType } from "./exhibitor-types";
import {
  ExhibitorNotFoundError,
  type ExhibitorContactInfo,
  type ExhibitorParticipantDetail,
  type ExhibitorSocialMedia,
} from "./exhibitor-detail-types";
import { resolveExhibitorDetailNavigation } from "./exhibitor-detail-navigation";
import {
  getTourStatus,
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
  phone_numbers: string[] | null;
  social_media: ExhibitorSocialMedia | Record<string, string> | null;
  visible_emails: string[] | null;
  visible_websites: string[] | null;
};

type HubHostMapContext = {
  address: string | null;
  mapInfoId: string | null;
};

const getParticipantType = async (
  supabase: SupabaseClient,
  userId: string,
  category: string
): Promise<ExhibitorType> => {
  const [categories, hubHostUserId] = await Promise.all([
    fetchParticipantCategories(supabase),
    resolveHubHostUserId(supabase, userId),
  ]);

  if (hubHostUserId) {
    return classifyHubMemberCategory(category, categories);
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

const resolveHubHostUserId = async (
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> => {
  const { data: hostedHub, error: hostedHubError } = await supabase
    .from("hubs")
    .select("hub_host_id")
    .eq("hub_host_id", userId)
    .limit(1)
    .maybeSingle();

  if (hostedHubError) {
    console.error("Error fetching hosted hub:", hostedHubError);
  }

  if (hostedHub?.hub_host_id) {
    return hostedHub.hub_host_id;
  }

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

  const { data: hub, error: hubError } = await supabase
    .from("hubs")
    .select("hub_host_id")
    .eq("id", membership.hub_id)
    .maybeSingle();

  if (hubError) {
    console.error("Error fetching hub host for member:", hubError);
    return null;
  }

  return hub?.hub_host_id ?? null;
};

const resolveHubHostMapContext = async (
  supabase: SupabaseClient,
  userId: string,
  tourStatus: TourStatus
): Promise<HubHostMapContext> => {
  const hubHostUserId = await resolveHubHostUserId(supabase, userId);
  if (!hubHostUserId) {
    return { address: null, mapInfoId: null };
  }

  const { data: hostParticipant, error: hostParticipantError } =
    await supabase
      .from("participant_details")
      .select("user_id, is_active, was_active_last_year, status")
      .eq("user_id", hubHostUserId)
      .maybeSingle();

  if (hostParticipantError) {
    console.error("Error fetching hub host participant:", hostParticipantError);
    return { address: null, mapInfoId: null };
  }

  if (
    !hostParticipant ||
    !isParticipantEligibleForExhibitorsList(
      hostParticipant,
      new Set(),
      tourStatus
    )
  ) {
    return { address: null, mapInfoId: null };
  }

  const { data: hostMapInfo, error: hostMapInfoError } = await supabase
    .from("map_info")
    .select("id, formatted_address, no_address")
    .eq("user_id", hubHostUserId)
    .maybeSingle();

  if (hostMapInfoError) {
    console.error("Error fetching hub host map info:", hostMapInfoError);
    return { address: null, mapInfoId: null };
  }

  if (!hostMapInfo?.id || hostMapInfo.no_address) {
    return { address: null, mapInfoId: null };
  }

  return {
    address: toBaseFormattedAddress(hostMapInfo.formatted_address) || null,
    mapInfoId: hostMapInfo.id,
  };
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
  tourStatus: TourStatus
): Promise<ExhibitorContactInfo> => {
  const [mapInfoResult, visitingHoursResult, eventsResult, hubHostMapContext] =
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
      resolveHubHostMapContext(supabase, userId, tourStatus),
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

  return {
    mapInfo,
    hubHostAddress: hubHostMapContext.address,
    hubHostMapInfoId: hubHostMapContext.mapInfoId,
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
  const [isSticky, tourStatus] = await Promise.all([
    isParticipantSticky(supabase, row.user_id),
    getTourStatus(supabase),
  ]);

  if (row.status === "accepted" && !isSticky) {
    if (!isParticipantPubliclyVisible(row, tourStatus)) {
      throw new ExhibitorNotFoundError();
    }
  }

  const placeholderUrl = await getParticipantPlaceholderUrl(supabase);
  const participantName = getParticipantDisplayName(row);

  const [imageResult, contactInfo, type] = await Promise.all([
    supabase
      .from("participant_image")
      .select("id, image_url")
      .eq("user_id", row.user_id)
      .order("id", { ascending: true }),
    buildContactInfo(supabase, row.user_id, row, tourStatus),
    getParticipantType(supabase, row.user_id, row.category),
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
