import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_MAP_FILTERS } from "./map-filters";
import {
  buildLocationSelectNavigation,
  buildRouteSelectNavigation,
  isRedundantLocationSelect,
  isRedundantRouteSelect,
} from "./map-selection-navigation";

describe("isRedundantLocationSelect", () => {
  it("shouldDetectSamePlaceMemberAndUrl", () => {
    assert.equal(
      isRedundantLocationSelect({
        resolvedLocationId: "loc-1",
        selectedLocation: "loc-1",
        urlPlaceId: "loc-1",
        memberUserId: "u1",
        selectedHubMemberId: "u1",
      }),
      true
    );
  });

  it("shouldAllowReselectWhenMemberChanges", () => {
    assert.equal(
      isRedundantLocationSelect({
        resolvedLocationId: "loc-1",
        selectedLocation: "loc-1",
        urlPlaceId: "loc-1",
        memberUserId: "u2",
        selectedHubMemberId: "u1",
      }),
      false
    );
  });
});

describe("buildLocationSelectNavigation", () => {
  it("shouldKeepCategoryViewOnDesktopListSelect", () => {
    const result = buildLocationSelectNavigation({
      locationId: "loc-1",
      isLargeScreen: true,
      filters: { ...DEFAULT_MAP_FILTERS, view: "category", type: "gallery" },
      source: "list",
    });
    assert.deepEqual(result.filterPatch, {
      view: "category",
      type: "gallery",
    });
    assert.deepEqual(result.selection, { place: "loc-1" });
  });

  it("shouldOpenExhibitorsViewOnDesktopListSelect", () => {
    const result = buildLocationSelectNavigation({
      locationId: "loc-1",
      isLargeScreen: true,
      filters: { ...DEFAULT_MAP_FILTERS, view: "exhibitors" },
      source: "list",
    });
    assert.deepEqual(result.filterPatch, { view: "exhibitors" });
  });

  it("shouldClearSearchOnMobileSearchSelect", () => {
    const result = buildLocationSelectNavigation({
      locationId: "loc-1",
      isLargeScreen: false,
      filters: DEFAULT_MAP_FILTERS,
      source: "search",
    });
    assert.equal(result.clearSearch, true);
    assert.deepEqual(result.filterPatch, {
      view: "none",
      q: "",
      type: "all",
    });
  });
});

describe("buildRouteSelectNavigation", () => {
  it("shouldPinRoutesViewOnSearchSelect", () => {
    const result = buildRouteSelectNavigation({
      routeId: "route-1",
      isLargeScreen: true,
      source: "search",
    });
    assert.deepEqual(result.filterPatch, {
      view: "routes",
      q: "",
      type: "all",
    });
  });

  it("shouldPinRoutesViewOnDesktopListSelectEvenFromCategory", () => {
    const result = buildRouteSelectNavigation({
      routeId: "route-1",
      isLargeScreen: true,
      source: "list",
    });
    assert.deepEqual(result.filterPatch, {
      view: "routes",
      q: "",
      type: "all",
    });
    assert.deepEqual(result.selection, { route: "route-1" });
  });

  it("shouldPinRoutesViewOnMapSelect", () => {
    const result = buildRouteSelectNavigation({
      routeId: "route-1",
      isLargeScreen: true,
      source: "map",
    });
    assert.deepEqual(result.filterPatch, {
      view: "routes",
      q: "",
      type: "all",
    });
  });
});

describe("isRedundantRouteSelect", () => {
  it("shouldDetectSameRouteAndUrl", () => {
    assert.equal(
      isRedundantRouteSelect({
        routeId: "route-1",
        selectedRoute: "route-1",
        urlRouteId: "route-1",
      }),
      true
    );
  });
});
