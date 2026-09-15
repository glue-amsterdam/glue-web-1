import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeMapUrlForCompare,
  shouldAckUrlWrite,
  shouldApplyUrlHydration,
} from "./map-url-sync";

describe("normalizeMapUrlForCompare", () => {
  it("shouldIgnoreParamOrderAndHash", () => {
    assert.equal(
      normalizeMapUrlForCompare("/map?route=r1&place=p1#x"),
      normalizeMapUrlForCompare("/map?place=p1&route=r1")
    );
  });
});

describe("shouldAckUrlWrite", () => {
  it("shouldAckWhenWrittenUrlMatchesCurrentSearch", () => {
    assert.equal(
      shouldAckUrlWrite({
        writtenUrl: "/map?place=loc-1",
        currentSearch: "place=loc-1",
        pathname: "/map",
      }),
      true
    );
  });

  it("shouldNotAckWhenCurrentSearchIsStale", () => {
    assert.equal(
      shouldAckUrlWrite({
        writtenUrl: "/map?place=loc-2",
        currentSearch: "place=loc-1",
        pathname: "/map",
      }),
      false
    );
  });
});

describe("shouldApplyUrlHydration", () => {
  it("shouldSkipWhileWriting", () => {
    const decision = shouldApplyUrlHydration({
      isWriting: true,
      pendingPlaceId: null,
      pendingRouteId: null,
      urlPlace: "loc-1",
      urlRoute: null,
      hasAnySearchParams: true,
    });
    assert.equal(decision.skip, true);
  });

  it("shouldBlockStalePlaceWhenPendingPlaceDiffers", () => {
    const decision = shouldApplyUrlHydration({
      isWriting: false,
      pendingPlaceId: "loc-2",
      pendingRouteId: null,
      urlPlace: "loc-1",
      urlRoute: null,
      hasAnySearchParams: true,
    });
    assert.equal(decision.skip, true);
    assert.equal(decision.applyPlace, false);
  });

  it("shouldApplyMatchingPendingPlace", () => {
    const decision = shouldApplyUrlHydration({
      isWriting: false,
      pendingPlaceId: "loc-1",
      pendingRouteId: null,
      urlPlace: "loc-1",
      urlRoute: null,
      hasAnySearchParams: true,
    });
    assert.equal(decision.applyPlace, true);
  });

  it("shouldBlockClearWhenPendingRouteForMobileRouteOnly", () => {
    const decision = shouldApplyUrlHydration({
      isWriting: false,
      pendingPlaceId: null,
      pendingRouteId: "route-1",
      urlPlace: null,
      urlRoute: null,
      hasAnySearchParams: false,
    });
    assert.equal(decision.skip, true);
    assert.equal(decision.clear, false);
  });

  it("shouldApplyRouteWhenPendingMatches", () => {
    const decision = shouldApplyUrlHydration({
      isWriting: false,
      pendingPlaceId: null,
      pendingRouteId: "route-1",
      urlPlace: null,
      urlRoute: "route-1",
      hasAnySearchParams: true,
    });
    assert.equal(decision.applyRoute, true);
  });
});
