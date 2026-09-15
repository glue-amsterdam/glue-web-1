import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveUrlSearchSync } from "./useDebouncedUrlSearch";

describe("resolveUrlSearchSync", () => {
  it("syncs empty url over stale non-empty committed value", () => {
    const decision = resolveUrlSearchSync({
      urlValue: "",
      committedValue: "darw",
      pendingCommitValue: null,
      preCommitUrlValue: null,
    });

    assert.deepEqual(decision, {
      action: "sync",
      nextInputValue: "",
      nextCommitted: "",
    });
  });

  it("waits while an in-flight commit still shows the pre-commit url", () => {
    const decision = resolveUrlSearchSync({
      urlValue: "old",
      committedValue: "new",
      pendingCommitValue: "new",
      preCommitUrlValue: "old",
    });

    assert.deepEqual(decision, { action: "wait" });
  });

  it("syncs when url is cleared instead of landing the pending commit", () => {
    const decision = resolveUrlSearchSync({
      urlValue: "",
      committedValue: "darw",
      pendingCommitValue: "darw",
      preCommitUrlValue: "darw",
    });

    assert.deepEqual(decision, {
      action: "sync",
      nextInputValue: "",
      nextCommitted: "",
    });
  });

  it("clears pending when url matches committed", () => {
    const decision = resolveUrlSearchSync({
      urlValue: "studio",
      committedValue: "studio",
      pendingCommitValue: "studio",
      preCommitUrlValue: "",
    });

    assert.deepEqual(decision, { action: "clear-pending" });
  });

  it("syncs external non-empty url changes", () => {
    const decision = resolveUrlSearchSync({
      urlValue: "vitra",
      committedValue: "",
      pendingCommitValue: null,
      preCommitUrlValue: null,
    });

    assert.deepEqual(decision, {
      action: "sync",
      nextInputValue: "vitra",
      nextCommitted: "vitra",
    });
  });
});
