import { compareDisplayNumbers } from "@/lib/numbers/compare-display-numbers";
import type { DisplayNumberRow } from "@/lib/numbers/get-display-numbers-panel-data";
import { toDisplayNumberHubInputs } from "@/lib/numbers/pick-inherited-hub";
import {
  resolveDisplayNumberBadges,
  type DisplayNumberBadge,
} from "@/lib/numbers/resolve-display-number-badges";

export type NumbersPanelListItem = {
  row: DisplayNumberRow;
  nestLevel: 0 | 1;
  mode: "edit" | "group-header";
  parentHubId?: string;
};

export const getNumbersRowKey = (row: DisplayNumberRow): string =>
  `${row.entityType}:${row.entityId}`;

const getSortKey = (displayNumber: string | null | undefined): string =>
  displayNumber?.trim() ?? "";

const compareSortKeys = (left: string, right: string): number => {
  if (left === "" && right === "") return 0;
  if (left === "") return 1;
  if (right === "") return -1;
  return compareDisplayNumbers(left, right);
};

const compareMembers = (
  left: DisplayNumberRow,
  right: DisplayNumberRow
): number => {
  if (left.context === "hub-host" && right.context !== "hub-host") return -1;
  if (right.context === "hub-host" && left.context !== "hub-host") return 1;
  return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
};

export const getNumbersRowPreviewBadges = (
  row: DisplayNumberRow
): DisplayNumberBadge[] => {
  if (row.entityType === "hub") {
    const value = row.displayNumber?.trim();
    return value
      ? [{ value, type: "hub", source: "own" }]
      : [];
  }

  return resolveDisplayNumberBadges({
    ownNumber: row.displayNumber,
    ownType: row.type || "standard",
    showHubNumber: row.showHubNumber,
    hubs: toDisplayNumberHubInputs(row.inheritedHubs),
  });
};

export const groupNumbersPanelRows = ({
  rows,
  visibleKeys,
  memberFilterKeys,
  includeHubRows,
  includeMembers,
  includeSolos,
  expandHubKeys,
}: {
  rows: DisplayNumberRow[];
  visibleKeys: Set<string>;
  memberFilterKeys: Set<string>;
  includeHubRows: boolean;
  includeMembers: boolean;
  includeSolos: boolean;
  expandHubKeys: Set<string>;
}): NumbersPanelListItem[] => {
  const hubs = rows.filter((row) => row.entityType === "hub");
  const participants = rows.filter((row) => row.entityType === "participant");
  const hubById = new Map(hubs.map((hub) => [hub.entityId, hub]));
  const membersByHubId = new Map<string, DisplayNumberRow[]>();
  const solos: DisplayNumberRow[] = [];

  for (const participant of participants) {
    if (participant.inheritedHubs.length === 0) {
      solos.push(participant);
      continue;
    }

    let placed = false;
    for (const inherited of participant.inheritedHubs) {
      if (!hubById.has(inherited.hubId)) continue;
      const members = membersByHubId.get(inherited.hubId) ?? [];
      members.push(participant);
      membersByHubId.set(inherited.hubId, members);
      placed = true;
    }

    if (!placed) {
      solos.push(participant);
    }
  }

  type Block =
    | {
        type: "group";
        hub: DisplayNumberRow;
        members: DisplayNumberRow[];
        sort: string;
      }
    | { type: "solo"; row: DisplayNumberRow; sort: string };

  const blocks: Block[] = [];

  for (const hub of hubs) {
    const hubKey = getNumbersRowKey(hub);
    const hubVisible = includeHubRows && visibleKeys.has(hubKey);
    const members = includeMembers
      ? (membersByHubId.get(hub.entityId) ?? []).sort(compareMembers)
      : [];
    const membersToShow = members.filter((member) => {
      const memberKey = getNumbersRowKey(member);
      return (
        visibleKeys.has(memberKey) ||
        (expandHubKeys.has(hubKey) && memberFilterKeys.has(memberKey))
      );
    });

    if (!hubVisible && membersToShow.length === 0) {
      continue;
    }

    blocks.push({
      type: "group",
      hub,
      members: membersToShow,
      sort: getSortKey(hub.displayNumber),
    });
  }

  if (includeSolos) {
    for (const solo of solos) {
      if (!visibleKeys.has(getNumbersRowKey(solo))) continue;
      blocks.push({
        type: "solo",
        row: solo,
        sort: getSortKey(solo.displayNumber),
      });
    }
  }

  blocks.sort((left, right) => compareSortKeys(left.sort, right.sort));

  const items: NumbersPanelListItem[] = [];

  for (const block of blocks) {
    if (block.type === "solo") {
      items.push({ row: block.row, nestLevel: 0, mode: "edit" });
      continue;
    }

    const hubKey = getNumbersRowKey(block.hub);
    const hubVisible = includeHubRows && visibleKeys.has(hubKey);

    if (includeHubRows && (hubVisible || block.members.length > 0)) {
      items.push({
        row: block.hub,
        nestLevel: 0,
        mode: hubVisible ? "edit" : "group-header",
      });
    }

    for (const member of block.members) {
      items.push({
        row: member,
        nestLevel: includeHubRows ? 1 : 0,
        mode: "edit",
        parentHubId: block.hub.entityId,
      });
    }
  }

  return items;
};
