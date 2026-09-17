import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LOOKING_HINT_AFTER_MS,
  buildQrBox,
  getAuthErrorMessage,
  pickRearCameraId,
} from "./qr-scanner-helpers";

describe("pickRearCameraId", () => {
  it("prefers a device whose label looks like a rear camera", () => {
    const id = pickRearCameraId([
      { id: "front", label: "Front Camera" },
      { id: "back", label: "Back Camera" },
    ]);
    assert.equal(id, "back");
  });

  it("matches environment / localized rear labels", () => {
    assert.equal(
      pickRearCameraId([
        { id: "a", label: "Camera 0" },
        { id: "b", label: "camera2 0, facing environment" },
      ]),
      "b",
    );
    assert.equal(
      pickRearCameraId([
        { id: "a", label: "Frontal" },
        { id: "b", label: "Cámara trasera" },
      ]),
      "b",
    );
  });

  it("falls back to the last device when labels are empty", () => {
    assert.equal(
      pickRearCameraId([
        { id: "first", label: "" },
        { id: "last", label: "" },
      ]),
      "last",
    );
  });

  it("returns the only device when there is one", () => {
    assert.equal(
      pickRearCameraId([{ id: "only", label: "" }]),
      "only",
    );
  });

  it("throws when the device list is empty", () => {
    assert.throws(() => pickRearCameraId([]), /No camera devices/);
  });
});

describe("buildQrBox", () => {
  it("uses about 80% of the smaller viewfinder edge", () => {
    assert.deepEqual(buildQrBox(400, 300), { width: 240, height: 240 });
  });

  it("enforces a minimum edge of 180", () => {
    assert.deepEqual(buildQrBox(100, 100), { width: 180, height: 180 });
  });
});

describe("getAuthErrorMessage", () => {
  it("returns actionable copy for 401", () => {
    assert.equal(
      getAuthErrorMessage(401, "Please sign in to scan QR codes."),
      "Session expired. Sign in again, then reopen Scan.",
    );
  });

  it("keeps the API message for 403 when present", () => {
    assert.equal(
      getAuthErrorMessage(403, "You do not have permission to scan this QR code."),
      "You do not have permission to scan this QR code.",
    );
  });

  it("falls back for empty 403 messages", () => {
    assert.equal(
      getAuthErrorMessage(403, "  "),
      "You do not have permission to scan this QR code.",
    );
  });

  it("passes through other statuses", () => {
    assert.equal(getAuthErrorMessage(400, "Bad token"), "Bad token");
  });
});

describe("LOOKING_HINT_AFTER_MS", () => {
  it("is about 4.5 seconds", () => {
    assert.equal(LOOKING_HINT_AFTER_MS, 4500);
  });
});
