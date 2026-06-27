import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExhibitorType } from "./exhibitor-types";
import {
  ExhibitorNotFoundError,
  type ExhibitorHubDetail,
  type ExhibitorHubMember,
} from "./exhibitor-detail-types";
import {
  getStickyParticipantIds,
  getTourStatus,
  isParticipantEligibleForExhibitorsList,
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
  special_program: boolean;
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

const getParticipantType = (specialProgram: boolean): ExhibitorType => {
  return specialProgram ? "special-program" : "up-to-three-participants";
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
        special_program,
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

  const placeholderUrl = getParticipantPlaceholderUrl(supabase);
  const imageMap = buildImageMap((imagesData as ImageRow[]) ?? []);

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
      type: getParticipantType(details.special_program),
    });
  }

  if (members.length === 0) {
    throw new ExhibitorNotFoundError();
  }

  const hubType: ExhibitorType =
    eligibleMemberIds.size > 3 ? "hub" : "up-to-three-participants";

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

  return {
    type: hubType,
    hubId: hubRow.id,
    name: hubRow.name,
    hubDisplayNumber: hubRow.display_number,
    description: hubRow.description?.trim() || null,
    mapInfoId,
    formattedAddress,
    members,
  };
};
