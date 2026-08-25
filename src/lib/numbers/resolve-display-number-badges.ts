import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import { compareDisplayNumbers } from "@/lib/numbers/compare-display-numbers";

export type DisplayNumberBadgeSource = "own" | "hub";

export type DisplayNumberBadge = {
  value: string;
  type: ExhibitorType;
  source: DisplayNumberBadgeSource;
};

export type DisplayNumberHubInput = {
  number: string | null | undefined;
  type: ExhibitorType;
};

const normalizeNumber = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const resolveInheritedBadgeType = (
  ownType: ExhibitorType,
  hubType: ExhibitorType
): ExhibitorType =>
  ownType === "sticky-participant" ? ownType : hubType;

export const resolveDisplayNumberBadges = (input: {
  ownNumber: string | null | undefined;
  ownType: ExhibitorType;
  showHubNumber: boolean;
  hubs?: DisplayNumberHubInput[];
}): DisplayNumberBadge[] => {
  const ownNumber = normalizeNumber(input.ownNumber);
  const badges: DisplayNumberBadge[] = [];
  const seen = new Set<string>();

  if (ownNumber) {
    badges.push({
      value: ownNumber,
      type: input.ownType,
      source: "own",
    });
    seen.add(ownNumber);
  }

  if (!input.showHubNumber) {
    return badges;
  }

  for (const hub of input.hubs ?? []) {
    const hubNumber = normalizeNumber(hub.number);
    if (!hubNumber || seen.has(hubNumber)) continue;
    seen.add(hubNumber);
    badges.push({
      value: hubNumber,
      type: resolveInheritedBadgeType(input.ownType, hub.type),
      source: "hub",
    });
  }

  badges.sort((left, right) => compareDisplayNumbers(left.value, right.value));

  return badges;
};

export const getPrimaryDisplayNumber = (
  badges: DisplayNumberBadge[]
): string | null => badges[0]?.value ?? null;
