import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DisplayNumberRow } from "./get-display-numbers-panel-data";
import {
  getNumbersRowKey,
  getNumbersRowPreviewBadges,
  groupNumbersPanelRows,
} from "./group-numbers-panel-rows";

const hubRow = (
  id: string,
  name: string,
  displayNumber: string | null
): DisplayNumberRow => ({
  entityType: "hub",
  entityId: id,
  name,
  displayNumber,
  isActive: true,
  status: "accepted",
  context: "hub",
  slug: null,
  showHubNumber: true,
  preferredHubId: null,
  inheritedHubs: [],
  type: "hub",
});

const participantRow = ({
  id,
  name,
  displayNumber,
  context,
  inheritedHubs,
  preferredHubId = null,
  showHubNumber = true,
  type,
}: {
  id: string;
  name: string;
  displayNumber: string | null;
  context: DisplayNumberRow["context"];
  inheritedHubs: DisplayNumberRow["inheritedHubs"];
  preferredHubId?: string | null;
  showHubNumber?: boolean;
  type?: string;
}): DisplayNumberRow => ({
  entityType: "participant",
  entityId: id,
  name,
  displayNumber,
  isActive: true,
  status: "accepted",
  context,
  slug: id,
  type: type ?? "standard",
  showHubNumber,
  preferredHubId,
  inheritedHubs,
});

const tankHub = hubRow("hub-tank", "TANK x SOLIDIFIED HUB", "10");
const waagHub = hubRow("hub-waag", "Waag Futurelab", "12");
const tankMembership = {
  hubId: "hub-tank",
  name: "TANK x SOLIDIFIED HUB",
  displayNumber: "10",
  type: "hub",
  isHost: false,
};
const waagMembership = {
  hubId: "hub-waag",
  name: "Waag Futurelab",
  displayNumber: "12",
  type: "hub",
  isHost: false,
};

const coen = participantRow({
  id: "coen",
  name: "Coen Beeksma",
  displayNumber: null,
  context: "hub-member",
  inheritedHubs: [tankMembership],
});
const vos = participantRow({
  id: "vos",
  name: "VOS DESIGN",
  displayNumber: "99",
  context: "hub-member",
  inheritedHubs: [tankMembership],
});
const hofstede = participantRow({
  id: "hofstede",
  name: "Hofstede Raanhuis",
  displayNumber: "11",
  context: "solo",
  inheritedHubs: [],
});

const allRows = [vos, tankHub, waagHub, hofstede, coen];
const allKeys = new Set(allRows.map(getNumbersRowKey));

describe("groupNumbersPanelRows", () => {
  it("places Hub members directly under their Hub, before later numbers", () => {
    const items = groupNumbersPanelRows({
      rows: allRows,
      visibleKeys: allKeys,
      memberFilterKeys: allKeys,
      includeHubRows: true,
      includeMembers: true,
      includeSolos: true,
      expandHubKeys: new Set(),
    });

    assert.deepEqual(
      items.map((item) => item.row.name),
      [
        "TANK x SOLIDIFIED HUB",
        "Coen Beeksma",
        "VOS DESIGN",
        "Hofstede Raanhuis",
        "Waag Futurelab",
      ]
    );
    assert.equal(items[1]?.nestLevel, 1);
    assert.equal(items[2]?.nestLevel, 1);
    assert.equal(items[3]?.nestLevel, 0);
  });

  it("keeps a member with a different own number under the Hub", () => {
    const items = groupNumbersPanelRows({
      rows: allRows,
      visibleKeys: allKeys,
      memberFilterKeys: allKeys,
      includeHubRows: true,
      includeMembers: true,
      includeSolos: true,
      expandHubKeys: new Set(),
    });

    const vosIndex = items.findIndex((item) => item.row.name === "VOS DESIGN");
    const tankIndex = items.findIndex(
      (item) => item.row.name === "TANK x SOLIDIFIED HUB"
    );

    assert.equal(vosIndex, tankIndex + 2);
  });

  it("shows a Hub header when only a member is visible", () => {
    const items = groupNumbersPanelRows({
      rows: allRows,
      visibleKeys: new Set([getNumbersRowKey(coen)]),
      memberFilterKeys: allKeys,
      includeHubRows: true,
      includeMembers: true,
      includeSolos: true,
      expandHubKeys: new Set(),
    });

    assert.equal(items.length, 2);
    assert.equal(items[0]?.row.name, "TANK x SOLIDIFIED HUB");
    assert.equal(items[0]?.mode, "group-header");
    assert.equal(items[1]?.row.name, "Coen Beeksma");
  });

  it("places a multi-Hub member under every Hub they belong to", () => {
    const dual = participantRow({
      id: "dual",
      name: "Dual Member",
      displayNumber: null,
      context: "hub-member",
      inheritedHubs: [tankMembership, waagMembership],
    });

    const items = groupNumbersPanelRows({
      rows: [...allRows, dual],
      visibleKeys: new Set([...allKeys, getNumbersRowKey(dual)]),
      memberFilterKeys: new Set([...allKeys, getNumbersRowKey(dual)]),
      includeHubRows: true,
      includeMembers: true,
      includeSolos: true,
      expandHubKeys: new Set(),
    });

    const names = items.map((item) => item.row.name);
    const tankIndex = names.indexOf("TANK x SOLIDIFIED HUB");
    const waagIndex = names.indexOf("Waag Futurelab");

    assert.equal(names.filter((name) => name === "Dual Member").length, 2);
    assert.equal(names[tankIndex + 2], "Dual Member");
    assert.equal(names[waagIndex + 1], "Dual Member");
  });
});

describe("getNumbersRowPreviewBadges", () => {
  it("shows the Hub number for a member without an own number", () => {
    const badges = getNumbersRowPreviewBadges(coen);
    assert.equal(badges.length, 1);
    assert.equal(badges[0]?.value, "10");
    assert.equal(badges[0]?.source, "hub");
  });

  it("keeps sticky color when inheriting a Hub number with no own number", () => {
    const badges = getNumbersRowPreviewBadges(
      participantRow({
        id: "sticky",
        name: "Sticky Member",
        displayNumber: null,
        context: "hub-member",
        inheritedHubs: [tankMembership],
        type: "sticky-participant",
      })
    );

    assert.equal(badges.length, 1);
    assert.equal(badges[0]?.value, "10");
    assert.equal(badges[0]?.type, "sticky-participant");
  });

  it("shows both Hub numbers on the preview", () => {
    const dual = participantRow({
      id: "dual-preview",
      name: "Dual Preview",
      displayNumber: null,
      context: "hub-member",
      inheritedHubs: [tankMembership, waagMembership],
    });
    const badges = getNumbersRowPreviewBadges(dual);
    assert.deepEqual(
      badges.map((badge) => badge.value),
      ["10", "12"]
    );
  });
});
