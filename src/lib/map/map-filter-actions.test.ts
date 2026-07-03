import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildOpenMapViewPatch,
  getClearPatchForView,
  getEffectiveMapViewMode,
  getSwitchViewPatch,
} from "./map-filter-actions";

describe("getClearPatchForView", () => {
  it("clears type when closing category view", () => {
    assert.deepEqual(getClearPatchForView("category"), { type: "all" });
  });

  it("clears q when closing exhibitors view", () => {
    assert.deepEqual(getClearPatchForView("exhibitors"), { q: "" });
  });

  it("does not clear selection params when closing routes view", () => {
    assert.deepEqual(getClearPatchForView("routes"), {});
  });

  it("returns empty patch for none view", () => {
    assert.deepEqual(getClearPatchForView("none"), {});
  });
});

describe("getSwitchViewPatch", () => {
  it("returns empty patch when views are the same", () => {
    assert.deepEqual(getSwitchViewPatch("category", "category"), {});
  });

  it("returns empty patch when switching from none", () => {
    assert.deepEqual(getSwitchViewPatch("none", "category"), {});
  });

  it("clears type and q when switching from category to routes", () => {
    assert.deepEqual(getSwitchViewPatch("category", "routes"), {
      type: "all",
      q: "",
    });
  });

  it("clears q when switching from exhibitors to category", () => {
    assert.deepEqual(getSwitchViewPatch("exhibitors", "category"), {
      q: "",
    });
  });

  it("clears type when switching to exhibitors", () => {
    assert.deepEqual(getSwitchViewPatch("category", "exhibitors"), {
      type: "all",
    });
  });
});

describe("getEffectiveMapViewMode", () => {
  it("prefers explicit view param", () => {
    assert.equal(
      getEffectiveMapViewMode({ view: "routes", type: "hub", q: "x" }),
      "routes"
    );
  });

  it("detects category filter when view is none", () => {
    assert.equal(
      getEffectiveMapViewMode({ view: "none", type: "hub", q: "" }),
      "category"
    );
  });

  it("detects search filter when view is none and no type", () => {
    assert.equal(
      getEffectiveMapViewMode({ view: "none", type: "all", q: "studio" }),
      "exhibitors"
    );
  });
});

describe("buildOpenMapViewPatch", () => {
  it("clears category type when opening exhibitors from mobile-style URL", () => {
    assert.deepEqual(
      buildOpenMapViewPatch(
        { view: "none", type: "hub", q: "" },
        "exhibitors"
      ),
      { view: "exhibitors", type: "all" }
    );
  });

  it("clears search when opening category from mobile-style URL", () => {
    assert.deepEqual(
      buildOpenMapViewPatch(
        { view: "none", type: "all", q: "studio" },
        "category"
      ),
      { view: "category", q: "" }
    );
  });
});
