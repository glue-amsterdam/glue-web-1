export type DisplayNumberOccupantKey = {
  entityType: "participant" | "hub";
  entityId: string;
};

export type HubMembershipLink = {
  userId: string;
  hubId: string;
};

export const filterHubMemberShareOccupants = <T extends DisplayNumberOccupantKey>(
  occupants: T[],
  params: {
    entityType: "participant" | "hub";
    entityId?: string;
    memberships: HubMembershipLink[];
  }
): T[] => {
  if (!params.entityId) {
    return occupants;
  }

  if (params.entityType === "participant") {
    const hubIds = new Set(
      params.memberships
        .filter((membership) => membership.userId === params.entityId)
        .map((membership) => membership.hubId)
    );

    return occupants.filter(
      (occupant) =>
        !(occupant.entityType === "hub" && hubIds.has(occupant.entityId))
    );
  }

  const memberIds = new Set(
    params.memberships
      .filter((membership) => membership.hubId === params.entityId)
      .map((membership) => membership.userId)
  );

  return occupants.filter(
    (occupant) =>
      !(
        occupant.entityType === "participant" &&
        memberIds.has(occupant.entityId)
      )
  );
};

export const hasDisplayNumberConflict = (
  occupants: DisplayNumberOccupantKey[],
  memberships: HubMembershipLink[]
): boolean => {
  const hubs = occupants.filter((occupant) => occupant.entityType === "hub");
  const participants = occupants.filter(
    (occupant) => occupant.entityType === "participant"
  );

  if (hubs.length > 1) {
    return true;
  }

  const hubIds = new Set(hubs.map((hub) => hub.entityId));
  const unexplainedParticipants = participants.filter((participant) => {
    return !memberships.some(
      (membership) =>
        membership.userId === participant.entityId &&
        hubIds.has(membership.hubId)
    );
  });

  if (unexplainedParticipants.length === 0) {
    return false;
  }

  if (hubs.length === 0) {
    return unexplainedParticipants.length > 1;
  }

  return true;
};
