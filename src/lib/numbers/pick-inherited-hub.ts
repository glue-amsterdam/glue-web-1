import type { DisplayNumberHubInput } from "@/lib/numbers/resolve-display-number-badges";

export type InheritedHubOption = {
  hubId: string;
  name: string;
  displayNumber: string | null;
  type: string;
  isHost: boolean;
};

export const toDisplayNumberHubInputs = (
  hubs: InheritedHubOption[]
): DisplayNumberHubInput[] =>
  hubs.map((hub) => ({ number: hub.displayNumber, type: hub.type }));

export const pickInheritedHub = (
  memberships: InheritedHubOption[],
  preferredHubId: string | null | undefined
): InheritedHubOption | null => {
  if (memberships.length === 0) {
    return null;
  }

  if (preferredHubId) {
    const preferred = memberships.find(
      (membership) => membership.hubId === preferredHubId
    );
    if (preferred) {
      return preferred;
    }
  }

  const hostMembership = memberships.find((membership) => membership.isHost);
  return hostMembership ?? memberships[0] ?? null;
};
