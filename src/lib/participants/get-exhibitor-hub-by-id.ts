import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyLocationType } from "@/lib/map/classify-location-type";
import {
  classifyHubMemberCategory,
  type ParticipantCategory,
} from "@/lib/participants/participant-categories";
import { getTheme } from "@/lib/theme";
import type { ExhibitorType } from "./exhibitor-types";
import {
  ExhibitorNotFoundError,
  type ExhibitorEventSummary,
  type ExhibitorHubDetail,
  type ExhibitorHubMember,
} from "./exhibitor-detail-types";
import {
  getStickyParticipantIds,
  getTourStatus,
  isParticipantEligibleForExhibitorsList,
  type TourStatus,
} from "./exhibitor-visibility";
import { toBaseFormattedAddress } from "@/lib/map/to-base-formatted-address";
import { getParticipantDisplayName } from "./get-participant-display-name";
import { getParticipantPlaceholderUrl } from "./get-participant-placeholder-url";
import { toMediaUrl } from "@/lib/media/media-url";

type ParticipantRow = {
  user_id: string;
  is_active: boolean;
  was_active_last_year: boolean;
  status: string;
};

type MemberParticipantRow = {
  user_id: string;
  slug: string;
  category: string;
  display_number: string | null;
  display_name: string | null;
};

type HubParticipantRow = {
  user_id: string;
};

type HubRow = {
  id: string;
  name: string;
  description: string | null;
  display_number: string | null;
  hub_host_id: string;
  hub_participants: HubParticipantRow | HubParticipantRow[] | null;
};

type ImageRow = {
  user_id: string;
  image_url: string;
};

const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const getParticipantType = (
  memberCount: number,
  category: string,
  categories: ParticipantCategory[]
): ExhibitorType =>
  classifyHubMemberCategory(memberCount, category, categories);

const buildImageMap = (images: ImageRow[]): Map<string, string> => {
  const map = new Map<string, string>();
  for (const image of images) {
    if (!map.has(image.user_id)) {
      map.set(image.user_id, toMediaUrl(image.image_url) ?? image.image_url);
    }
  }
  return map;
};

const getEligibleHubMemberIds = (
  hub: HubRow,
  eligibleParticipantIds: Set<string>
): Set<string> => {
  const memberIds = new Set<string>();

  if (eligibleParticipantIds.has(hub.hub_host_id)) {
    memberIds.add(hub.hub_host_id);
  }

  for (const participant of ensureArray(hub.hub_participants)) {
    if (eligibleParticipantIds.has(participant.user_id)) {
      memberIds.add(participant.user_id);
    }
  }

  return memberIds;
};

const getOrderedEligibleMemberIds = (
  hub: HubRow,
  eligibleMemberIds: Set<string>
): string[] => {
  const ordered: string[] = [];

  if (eligibleMemberIds.has(hub.hub_host_id)) {
    ordered.push(hub.hub_host_id);
  }

  for (const participant of ensureArray(hub.hub_participants)) {
    const { user_id } = participant;
    if (
      eligibleMemberIds.has(user_id) &&
      user_id !== hub.hub_host_id &&
      !ordered.includes(user_id)
    ) {
      ordered.push(user_id);
    }
  }

  return ordered;
};

export const getExhibitorHubById = async (
  supabase: SupabaseClient,
  hubId: string
): Promise<ExhibitorHubDetail> => {
  const { participantCategories: categories } = await getTheme();

  const { data: hub, error: hubError } = await supabase
    .from("hubs")
    .select(
      `
        id,
        name,
        description,
        display_number,
        hub_host_id,
        hub_participants (
          user_id
        )
      `
    )
    .eq("id", hubId)
    .single();

  if (hubError) {
    if (hubError.code === "PGRST116") {
      throw new ExhibitorNotFoundError();
    }
    throw hubError;
  }

  if (!hub) {
    throw new ExhibitorNotFoundError();
  }

  const hubRow = hub as HubRow;
  const tourStatus = await getTourStatus(supabase);
  const stickyIds = await getStickyParticipantIds(supabase);

  const memberIds = [
    hubRow.hub_host_id,
    ...ensureArray(hubRow.hub_participants).map((p) => p.user_id),
  ];

  const { data: participantsData, error: participantsError } = await supabase
    .from("participant_details")
    .select("user_id, is_active, was_active_last_year, status")
    .in("user_id", memberIds)
    .eq("status", "accepted");

  if (participantsError) {
    throw participantsError;
  }

  const participants = (participantsData as ParticipantRow[]) ?? [];
  const eligibleParticipantIds = new Set(
    participants
      .filter((p) =>
        isParticipantEligibleForExhibitorsList(p, stickyIds, tourStatus)
      )
      .map((p) => p.user_id)
  );

  if (!eligibleParticipantIds.has(hubRow.hub_host_id)) {
    throw new ExhibitorNotFoundError();
  }

  const eligibleMemberIds = getEligibleHubMemberIds(
    hubRow,
    eligibleParticipantIds
  );

  if (eligibleMemberIds.size === 0) {
    throw new ExhibitorNotFoundError();
  }

  const orderedMemberIds = getOrderedEligibleMemberIds(
    hubRow,
    eligibleMemberIds
  );

  const { data: memberDetailsData, error: memberDetailsError } = await supabase
    .from("participant_details")
    .select(
      `
        user_id,
        slug,
        category,
        display_number,
        display_name
      `
    )
    .in("user_id", orderedMemberIds)
    .eq("status", "accepted");

  if (memberDetailsError) {
    throw memberDetailsError;
  }

  const memberDetailsByUserId = new Map(
    ((memberDetailsData as MemberParticipantRow[]) ?? []).map((row) => [
      row.user_id,
      row,
    ])
  );

  const hostDetails = memberDetailsByUserId.get(hubRow.hub_host_id);
  if (!hostDetails?.slug?.trim()) {
    throw new ExhibitorNotFoundError();
  }

  const { data: imagesData, error: imagesError } = await supabase
    .from("participant_image")
    .select("user_id, image_url")
    .in("user_id", orderedMemberIds)
    .order("id", { ascending: true });

  if (imagesError) {
    console.error("Error fetching hub member images:", imagesError);
  }

  const placeholderUrl = await getParticipantPlaceholderUrl(supabase);
  const imageMap = buildImageMap((imagesData as ImageRow[]) ?? []);
  const hubMemberCount = eligibleMemberIds.size;

  const members: ExhibitorHubMember[] = [];

  for (const userId of orderedMemberIds) {
    const details = memberDetailsByUserId.get(userId);
    if (!details?.slug?.trim()) {
      continue;
    }

    members.push({
      userId,
      slug: details.slug,
      name: getParticipantDisplayName(details),
      imageUrl: imageMap.get(userId) ?? placeholderUrl,
      displayNumber: details.display_number,
      type: getParticipantType(hubMemberCount, details.category, categories),
    });
  }

  if (members.length === 0) {
    throw new ExhibitorNotFoundError();
  }

  const hubType = classifyLocationType(
    eligibleMemberIds.size,
    hostDetails.category,
    categories
  );

  const { data: mapInfo, error: mapInfoError } = await supabase
    .from("map_info")
    .select("id, formatted_address")
    .eq("user_id", hubRow.hub_host_id)
    .maybeSingle();

  if (mapInfoError) {
    console.error("Error fetching hub host map info:", mapInfoError);
  }

  const mapInfoId = mapInfo?.id ?? null;
  const formattedAddress = mapInfo?.formatted_address
    ? toBaseFormattedAddress(mapInfo.formatted_address)
    : null;

  const events = await fetchHubEventsByLocationId(
    supabase,
    mapInfoId,
    tourStatus
  );

  return {
    type: hubType,
    hubId: hubRow.id,
    name: hubRow.name,
    hubDisplayNumber: hubRow.display_number,
    description: hubRow.description?.trim() || null,
    mapInfoId,
    formattedAddress,
    events,
    members,
  };
};

const fetchHubEventsByLocationId = async (
  supabase: SupabaseClient,
  mapInfoId: string | null,
  tourStatus: TourStatus
): Promise<ExhibitorEventSummary[]> => {
  if (!mapInfoId) {
    return [];
  }

  let query = supabase
    .from("events")
    .select("id, image_url, title")
    .eq("location_id", mapInfoId)
    .eq("event_day_out", false);

  if (tourStatus === "new") {
    query = query.eq("is_last_year_event", false);
  } else {
    query = query.eq("is_last_year_event", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching hub events by location:", error);
    return [];
  }

  return data ?? [];
};
