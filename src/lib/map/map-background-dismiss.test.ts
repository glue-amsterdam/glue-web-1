import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveMapBackgroundDismissAction } from "./map-background-dismiss";

describe("resolveMapBackgroundDismissAction", () => {
  it("shouldClearStopFirst", () => {
    assert.equal(
      resolveMapBackgroundDismissAction({
        selectedLocation: "loc-1",
        selectedRoute: "route-1",
        activeRouteStopId: "stop-1",
      }),
      "clear-stop"
    );
  });

  it("shouldClearLocationBeforeRoute", () => {
    assert.equal(
      resolveMapBackgroundDismissAction({
        selectedLocation: "loc-1",
        selectedRoute: "route-1",
        activeRouteStopId: null,
      }),
      "clear-location"
    );
  });

  it("shouldClearRouteWhenOnlyRouteSelected", () => {
    assert.equal(
      resolveMapBackgroundDismissAction({
        selectedLocation: null,
        selectedRoute: "route-1",
        activeRouteStopId: null,
      }),
      "clear-route"
    );
  });

  it("shouldNoopWhenNothingSelected", () => {
    assert.equal(
      resolveMapBackgroundDismissAction({
        selectedLocation: null,
        selectedRoute: null,
        activeRouteStopId: null,
      }),
      "noop"
    );
  });
});
