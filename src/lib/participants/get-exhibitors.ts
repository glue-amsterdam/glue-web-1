import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExhibitorItem,
  ExhibitorsGroupedResponse,
  ExhibitorType,
} from "./exhibitor-types";
import {
  getStickyParticipantIds,
  getTourStatus,
  isParticipantEligibleForExhibitorsList,
} from "./exhibitor-visibility";
import { getParticipantDisplayName } from "./get-participant-display-name";
import { getParticipantPlaceholderUrl } from "./get-participant-placeholder-url";
import { toMediaUrl } from "@/lib/media/media-url";

type ParticipantRow = {
  user_id: string;
  slug: string;
  special_program: boolean;
  display_number: string | null;
  is_active: boolean;
  was_active_last_year: boolean;
  status: string;
  display_name: string | null;
};

type HubParticipantRow = {
  user_id: string;
};

type HubRow = {
  id: string;
  name: string;
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

const buildImageMap = (images: ImageRow[]): Map<string, string> => {
  const map = new Map<string, string>();
  for (const image of images) {
    if (!map.has(image.user_id)) {
      map.set(image.user_id, toMediaUrl(image.image_url) ?? image.image_url);
    }
  }
  return map;
};

const getImageUrl = (
  imageMap: Map<string, string>,
  userId: string,
  placeholderUrl: string
): string => {
  return imageMap.get(userId) ?? placeholderUrl;
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

const buildParticipantItem = (
  participant: ParticipantRow,
  imageMap: Map<string, string>,
  placeholderUrl: string
): ExhibitorItem => {
  const type: ExhibitorType = participant.special_program
    ? "special-program"
    : "up-to-three-participants";

  return {
    type,
    name: getParticipantDisplayName(participant),
    imageUrl: getImageUrl(imageMap, participant.user_id, placeholderUrl),
    displayNumber: participant.display_number,
    hubDisplayNumber: null,
    userId: participant.user_id,
    slug: participant.slug,
  };
};

const buildHubItem = (
  hub: HubRow,
  hubType: ExhibitorType,
  imageMap: Map<string, string>,
  placeholderUrl: string
): ExhibitorItem => {
  return {
    type: hubType,
    name: hub.name,
    imageUrl: getImageUrl(imageMap, hub.hub_host_id, placeholderUrl),
    displayNumber: null,
    hubDisplayNumber: hub.display_number,
    hubId: hub.id,
  };
};

export const getExhibitors = async (
  supabase: SupabaseClient
): Promise<ExhibitorsGroupedResponse> => {
  const [
    currentTourStatus,
    stickyIds,
    participantsResult,
    hubsResult,
    imagesResult,
  ] = await Promise.all([
    getTourStatus(supabase),
    getStickyParticipantIds(supabase),
    supabase
      .from("participant_details")
      .select(
        `
        user_id,
        slug,
        special_program,
        display_number,
        is_active,
        was_active_last_year,
        status,
        display_name
      `
      )
      .eq("status", "accepted"),
    supabase.from("hubs").select(
      `
        id,
        name,
        display_number,
        hub_host_id,
        hub_participants (
          user_id
        )
      `
    ),
    supabase
      .from("participant_image")
      .select("user_id, image_url")
      .order("id", { ascending: true }),
  ]);

  if (participantsResult.error) throw participantsResult.error;
  if (hubsResult.error) throw hubsResult.error;
  if (imagesResult.error) {
    console.error("Error fetching participant images:", imagesResult.error);
  }

  const imageMap = buildImageMap((imagesResult.data as ImageRow[]) ?? []);
  const placeholderUrl = getParticipantPlaceholderUrl(supabase);

  const participants = (participantsResult.data as ParticipantRow[]) ?? [];
  const eligibleParticipants = participants.filter((participant) =>
    isParticipantEligibleForExhibitorsList(
      participant,
      stickyIds,
      currentTourStatus
    )
  );

  const eligibleParticipantIds = new Set(
    eligibleParticipants.map((participant) => participant.user_id)
  );

  const specialProgram: ExhibitorItem[] = [];
  const upToThreeParticipants: ExhibitorItem[] = [];
  const hubs: ExhibitorItem[] = [];

  for (const participant of eligibleParticipants) {
    const item = buildParticipantItem(participant, imageMap, placeholderUrl);

    if (item.type === "special-program") {
      specialProgram.push(item);
      continue;
    }

    upToThreeParticipants.push(item);
  }

  const hubRows = (hubsResult.data as HubRow[]) ?? [];

  for (const hub of hubRows) {
    if (!eligibleParticipantIds.has(hub.hub_host_id)) continue;

    const eligibleMemberIds = getEligibleHubMemberIds(
      hub,
      eligibleParticipantIds
    );
    const memberCount = eligibleMemberIds.size;

    if (memberCount === 0) continue;

    const hubType: ExhibitorType =
      memberCount > 3 ? "hub" : "up-to-three-participants";
    const hubItem = buildHubItem(hub, hubType, imageMap, placeholderUrl);

    if (hubType === "hub") {
      hubs.push(hubItem);
      continue;
    }

    upToThreeParticipants.push(hubItem);
  }

  return {
    specialProgram,
    upToThreeParticipants,
    hubs,
  };
};
