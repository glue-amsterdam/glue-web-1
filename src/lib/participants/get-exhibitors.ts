import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExhibitorItem,
  ExhibitorsGroupedResponse,
  ExhibitorType,
} from "./exhibitor-types";
import {
  classifyCategory,
  classifyHubMemberCategory,
  fetchParticipantCategories,
} from "./participant-categories";
import { createEmptyGroupedExhibitors } from "./flatten-exhibitors";
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
  category: string;
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

const pushToGroup = (
  grouped: ExhibitorsGroupedResponse,
  type: ExhibitorType,
  item: ExhibitorItem
): void => {
  if (!grouped[type]) {
    grouped[type] = [];
  }
  grouped[type].push(item);
};

const buildParticipantItem = (
  participant: ParticipantRow,
  type: ExhibitorType,
  imageMap: Map<string, string>,
  placeholderUrl: string
): ExhibitorItem => ({
  type,
  name: getParticipantDisplayName(participant),
  imageUrl: getImageUrl(imageMap, participant.user_id, placeholderUrl),
  displayNumber: participant.display_number,
  hubDisplayNumber: null,
  userId: participant.user_id,
  slug: participant.slug,
});

const buildHubItem = (
  hub: HubRow,
  hubType: ExhibitorType,
  imageMap: Map<string, string>,
  placeholderUrl: string
): ExhibitorItem => ({
  type: hubType,
  name: hub.name,
  imageUrl: getImageUrl(imageMap, hub.hub_host_id, placeholderUrl),
  displayNumber: null,
  hubDisplayNumber: hub.display_number,
  hubId: hub.id,
});

export const getExhibitors = async (
  supabase: SupabaseClient
): Promise<ExhibitorsGroupedResponse> => {
  const categories = await fetchParticipantCategories(supabase);
  const categorySlugs = categories.map((c) => c.slug);
  const grouped = createEmptyGroupedExhibitors(categorySlugs);

  const [
    currentTourStatus,
    stickyIds,
    participantsResult,
    hubsResult,
  ] = await Promise.all([
    getTourStatus(supabase),
    getStickyParticipantIds(supabase),
    supabase
      .from("participant_details")
      .select(
        `
        user_id,
        slug,
        category,
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
  ]);

  if (participantsResult.error) throw participantsResult.error;
  if (hubsResult.error) throw hubsResult.error;

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

  const participantByUserId = new Map(
    eligibleParticipants.map((participant) => [participant.user_id, participant])
  );

  const hubRows = (hubsResult.data as HubRow[]) ?? [];
  const imageUserIds = new Set(eligibleParticipantIds);
  for (const hub of hubRows) {
    if (eligibleParticipantIds.has(hub.hub_host_id)) {
      imageUserIds.add(hub.hub_host_id);
    }
  }

  const [imagesResult, placeholderUrl] = await Promise.all([
    imageUserIds.size > 0
      ? supabase
          .from("participant_image")
          .select("user_id, image_url")
          .in("user_id", Array.from(imageUserIds))
          .order("id", { ascending: true })
      : Promise.resolve({ data: [] as ImageRow[], error: null }),
    getParticipantPlaceholderUrl(supabase),
  ]);

  if (imagesResult.error) {
    console.error("Error fetching participant images:", imagesResult.error);
  }

  const imageMap = buildImageMap((imagesResult.data as ImageRow[]) ?? []);

  const hubMemberCountByUserId = new Map<string, number>();

  for (const hub of hubRows) {
    if (!eligibleParticipantIds.has(hub.hub_host_id)) continue;

    const eligibleMemberIds = getEligibleHubMemberIds(
      hub,
      eligibleParticipantIds
    );
    const memberCount = eligibleMemberIds.size;

    for (const userId of eligibleMemberIds) {
      hubMemberCountByUserId.set(userId, memberCount);
    }
  }

  for (const participant of eligibleParticipants) {
    const hubMemberCount = hubMemberCountByUserId.get(participant.user_id);
    const type =
      hubMemberCount !== undefined
        ? classifyHubMemberCategory(
            hubMemberCount,
            participant.category,
            categories
          )
        : classifyCategory(1, participant.category, categories);
    const item = buildParticipantItem(
      participant,
      type,
      imageMap,
      placeholderUrl
    );
    pushToGroup(grouped, type, item);
  }

  for (const hub of hubRows) {
    if (!eligibleParticipantIds.has(hub.hub_host_id)) continue;

    const eligibleMemberIds = getEligibleHubMemberIds(
      hub,
      eligibleParticipantIds
    );
    const memberCount = eligibleMemberIds.size;

    if (memberCount === 0) continue;

    const hostParticipant = participantByUserId.get(hub.hub_host_id);
    const hubType = classifyCategory(
      memberCount,
      hostParticipant?.category,
      categories
    );
    const hubItem = buildHubItem(hub, hubType, imageMap, placeholderUrl);
    pushToGroup(grouped, hubType, hubItem);
  }

  return grouped;
};
