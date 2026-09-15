import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSelectedRouteLinePaint,
  SELECTED_ROUTE_LINE_DASHARRAY,
  SELECTED_ROUTE_LINE_WIDTH,
} from "./map-route-line-paint";

describe("buildSelectedRouteLinePaint", () => {
  it("shouldUseDesktopWidthOnLargeScreen", () => {
    const paint = buildSelectedRouteLinePaint({
      color: "#10069F",
      isLargeScreen: true,
    });
    assert.equal(paint["line-color"], "#10069F");
    assert.equal(paint["line-width"], SELECTED_ROUTE_LINE_WIDTH.desktop);
    assert.deepEqual(paint["line-dasharray"], [...SELECTED_ROUTE_LINE_DASHARRAY]);
  });

  it("shouldUseMobileWidthOnSmallScreen", () => {
    const paint = buildSelectedRouteLinePaint({
      color: "#10069F",
      isLargeScreen: false,
    });
    assert.equal(paint["line-width"], SELECTED_ROUTE_LINE_WIDTH.mobile);
  });
});
