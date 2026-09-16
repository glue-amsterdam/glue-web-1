import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseUuidParam } from "./uuid";

/** Fixtures from glue-amsterdam Postgres/edge logs (Sep 2026). */
const VALID_HUB_ID = "c16f973d-30b3-4822-9252-fd8ccc890f7b";
const DIRTY_FIXTURES = [
  "c16f973d-30b3-4822-9252-fd8ccc890f7b)",
  "45235550-a5c6-4abd-9e84-e1f8ad6e0f3c&quot",
  "45235550-a5c6-4abd-9e84-e1f8ad6e0f3c%26quot",
  "hello@themillenhouse.com",
  "hello%40themillenhouse.com",
  "",
  "   ",
] as const;

describe("parseUuidParam", () => {
  it("accepts a canonical UUID", () => {
    assert.equal(parseUuidParam(VALID_HUB_ID), VALID_HUB_ID);
  });

  it("trims whitespace around a valid UUID", () => {
    assert.equal(parseUuidParam(`  ${VALID_HUB_ID}  `), VALID_HUB_ID);
  });

  for (const dirty of DIRTY_FIXTURES) {
    it(`rejects dirty param ${JSON.stringify(dirty)}`, () => {
      assert.equal(parseUuidParam(dirty), null);
    });
  }

  it("does not strip a trailing parenthesis (fail-closed)", () => {
    assert.equal(parseUuidParam(`${VALID_HUB_ID})`), null);
  });

  it("does not strip an &quot suffix (fail-closed)", () => {
    assert.equal(
      parseUuidParam("45235550-a5c6-4abd-9e84-e1f8ad6e0f3c&quot"),
      null
    );
  });
});
