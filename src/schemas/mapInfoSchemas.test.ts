import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapInfoSchema } from "./mapInfoSchemas";
import { reactivationRequestSubmissionSchema } from "./participantDetailsSchemas";

const validAddressPayload = {
  formatted_address: "Example Street 1, Berlin",
  latitude: 52.52,
  longitude: 13.405,
  no_address: false,
};

const validNoAddressPayload = {
  formatted_address: null,
  latitude: null,
  longitude: null,
  no_address: true,
};

const minimalReactivationPayload = {
  plan_id: "plan-123",
  termsAccepted: true,
  invoice_company_name: "Acme GmbH",
  invoice_zip_code: "10115",
  invoice_address: "Example Street 1",
  invoice_country: "Germany",
  invoice_city: "Berlin",
  glue_communication_email: "contact@example.com",
};

describe("mapInfoSchema location validation", () => {
  it("accepts no_address with null location fields", () => {
    const result = mapInfoSchema.safeParse(validNoAddressPayload);
    assert.equal(result.success, true);
  });

  it("accepts a complete address with coordinates", () => {
    const result = mapInfoSchema.safeParse(validAddressPayload);
    assert.equal(result.success, true);
  });

  it("rejects missing location when no_address is false", () => {
    const result = mapInfoSchema.safeParse({
      formatted_address: null,
      latitude: null,
      longitude: null,
      no_address: false,
    });

    assert.equal(result.success, false);
    if (result.success) return;

    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "formatted_address" &&
          issue.message.includes("don't have one")
      ),
      true
    );
  });

  it("rejects free-text address without coordinates", () => {
    const result = mapInfoSchema.safeParse({
      formatted_address: "Typed manually without selecting a suggestion",
      latitude: null,
      longitude: null,
      no_address: false,
    });

    assert.equal(result.success, false);
    if (result.success) return;

    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "formatted_address" &&
          issue.message.includes("suggestions")
      ),
      true
    );
  });
});

describe("reactivationRequestSubmissionSchema location validation", () => {
  it("accepts no_address with null location fields", () => {
    const result = reactivationRequestSubmissionSchema.safeParse({
      ...minimalReactivationPayload,
      ...validNoAddressPayload,
    });
    assert.equal(result.success, true);
  });

  it("accepts a complete address with coordinates", () => {
    const result = reactivationRequestSubmissionSchema.safeParse({
      ...minimalReactivationPayload,
      ...validAddressPayload,
    });
    assert.equal(result.success, true);
  });

  it("rejects missing location when no_address is false", () => {
    const result = reactivationRequestSubmissionSchema.safeParse({
      ...minimalReactivationPayload,
      formatted_address: null,
      latitude: null,
      longitude: null,
      no_address: false,
    });

    assert.equal(result.success, false);
    if (result.success) return;

    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "formatted_address" &&
          issue.message.includes("don't have one")
      ),
      true
    );
  });

  it("rejects free-text address without coordinates", () => {
    const result = reactivationRequestSubmissionSchema.safeParse({
      ...minimalReactivationPayload,
      formatted_address: "Typed manually without selecting a suggestion",
      latitude: null,
      longitude: null,
      no_address: false,
    });

    assert.equal(result.success, false);
    if (result.success) return;

    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "formatted_address" &&
          issue.message.includes("suggestions")
      ),
      true
    );
  });
});
