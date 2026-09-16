import "./_test-env";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEntityMetadata } from "./build-entity-metadata";

describe("buildEntityMetadata", () => {
  it("sets canonical, title, robots, and openGraph url without JSON-LD meta", () => {
    const metadata = buildEntityMetadata({
      title: "GLUE Amsterdam - Test Hub",
      description: "A hub description for metadata.",
      canonicalPath: "/exhibitors/hub/c16f973d-30b3-4822-9252-fd8ccc890f7b",
      authors: ["Test Hub"],
      creator: "Test Hub",
    });

    assert.equal(metadata.title, "GLUE Amsterdam - Test Hub");
    assert.equal(
      metadata.alternates?.canonical,
      "https://example.test/exhibitors/hub/c16f973d-30b3-4822-9252-fd8ccc890f7b"
    );
    assert.equal(
      metadata.openGraph?.url,
      "https://example.test/exhibitors/hub/c16f973d-30b3-4822-9252-fd8ccc890f7b"
    );
    assert.equal(metadata.robots?.index, true);
    assert.equal(metadata.other?.["application/ld+json"], undefined);
    assert.equal(metadata.other, undefined);
  });

  it("marks fallback-style non-indexable metadata when indexable is false", () => {
    const metadata = buildEntityMetadata({
      title: "GLUE Amsterdam | Exhibitor Hub",
      description: "Fallback",
      canonicalPath: "/exhibitors/hub/not-a-uuid)",
      indexable: false,
    });

    assert.equal(metadata.robots?.index, false);
    assert.equal(metadata.other?.["application/ld+json"], undefined);
  });
});
