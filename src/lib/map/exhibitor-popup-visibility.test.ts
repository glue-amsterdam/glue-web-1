import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveExhibitorPopupLayoutTransition,
  shouldShowExhibitorPopup,
  type ExhibitorPopupLayoutLite,
} from "./exhibitor-popup-visibility";

const layoutLeft: ExhibitorPopupLayoutLite = {
  anchor: "left",
  offset: [16, 0],
};

const layoutRight: ExhibitorPopupLayoutLite = {
  anchor: "right",
  offset: [-16, 0],
};

describe("shouldShowExhibitorPopup", () => {
  it("shouldReturnFalseWhenLocationMissing", () => {
    assert.equal(
      shouldShowExhibitorPopup({
        location: null,
        isLargeScreen: true,
        layout: layoutLeft,
      }),
      false
    );
  });

  it("shouldReturnFalseWhenLayoutMissingOnDesktop", () => {
    assert.equal(
      shouldShowExhibitorPopup({
        location: { id: "loc-1" },
        isLargeScreen: true,
        layout: null,
      }),
      false
    );
  });

  it("shouldReturnTrueWhenReadyOnDesktop", () => {
    assert.equal(
      shouldShowExhibitorPopup({
        location: { id: "loc-1" },
        isLargeScreen: true,
        layout: layoutLeft,
      }),
      true
    );
  });
});

describe("resolveExhibitorPopupLayoutTransition", () => {
  it("shouldKeepPreviousLayoutWhenSelectionActiveAndNextNull", () => {
    assert.equal(
      resolveExhibitorPopupLayoutTransition({
        prevLayout: layoutLeft,
        nextLayout: null,
        hasSelection: true,
      }),
      layoutLeft
    );
  });

  it("shouldApplyNextLayoutWhenSelectionActive", () => {
    assert.equal(
      resolveExhibitorPopupLayoutTransition({
        prevLayout: layoutLeft,
        nextLayout: layoutRight,
        hasSelection: true,
      }),
      layoutRight
    );
  });

  it("shouldClearLayoutWhenNoSelection", () => {
    assert.equal(
      resolveExhibitorPopupLayoutTransition({
        prevLayout: layoutLeft,
        nextLayout: layoutRight,
        hasSelection: false,
      }),
      null
    );
  });
});
