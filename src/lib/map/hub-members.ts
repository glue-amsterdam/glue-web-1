import { ensureArray } from "./utils";

type HubParticipantRow = { user_id: string };

type HubRow = {
  hub_host_id: string;
  hub_participants: HubParticipantRow | HubParticipantRow[] | null;
};

export const getEligibleHubMemberIds = (
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

export const getOrderedEligibleMemberIds = (
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
