import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MapLocationDetail } from "./types";
import {
  getCachedDetail,
  resolveDisplayedDetail,
  upsertDetail,
  type MapLocationDetailCache,
} from "./map-location-detail-cache";

const detailA: MapLocationDetail = {
  imageUrl: "/a.jpg",
  description: "A",
  memberCount: 1,
  profileHref: "/a",
};

const detailB: MapLocationDetail = {
  imageUrl: "/b.jpg",
  description: "B",
  memberCount: 2,
  profileHref: "/b",
};

describe("map-location-detail-cache", () => {
  it("shouldReturnCachedDetailOnHit", () => {
    const cache: MapLocationDetailCache = { "loc-a": detailA };
    assert.equal(getCachedDetail(cache, "loc-a"), detailA);
    assert.equal(getCachedDetail(cache, "missing"), null);
    assert.equal(getCachedDetail(cache, null), null);
  });

  it("shouldUpsertWithoutClearingOtherIds", () => {
    const cache = upsertDetail({ "loc-a": detailA }, "loc-b", detailB);
    assert.equal(cache["loc-a"], detailA);
    assert.equal(cache["loc-b"], detailB);
  });

  it("shouldShowCachedDetailImmediatelyOnIdChange", () => {
    const cache: MapLocationDetailCache = { "loc-a": detailA, "loc-b": detailB };
    const resolved = resolveDisplayedDetail({
      cache,
      mapInfoId: "loc-b",
      incoming: null,
    });
    assert.equal(resolved.detail, detailB);
    assert.equal(resolved.isLoading, false);
  });

  it("shouldReportLoadingOnCacheMiss", () => {
    const resolved = resolveDisplayedDetail({
      cache: {},
      mapInfoId: "loc-a",
      incoming: null,
    });
    assert.equal(resolved.detail, null);
    assert.equal(resolved.isLoading, true);
  });

  it("shouldPreferIncomingOverCache", () => {
    const cache: MapLocationDetailCache = { "loc-a": detailA };
    const resolved = resolveDisplayedDetail({
      cache,
      mapInfoId: "loc-a",
      incoming: detailB,
    });
    assert.equal(resolved.detail, detailB);
    assert.equal(resolved.isLoading, false);
  });

  it("shouldClearDisplayWhenDisabled", () => {
    const resolved = resolveDisplayedDetail({
      cache: { "loc-a": detailA },
      mapInfoId: null,
      incoming: null,
    });
    assert.equal(resolved.detail, null);
    assert.equal(resolved.isLoading, false);
  });
});
