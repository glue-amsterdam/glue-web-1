import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getExhibitorsGroupedFromSnapshot,
  getExhibitorDetailFromSnapshot,
  getHubDetailFromSnapshot,
  getParticipantCategoriesFromSnapshot,
  getProgramDetailFromSnapshot,
  getProgramListFromSnapshot,
  normalizeParticipantCategoriesSnapshot,
  normalizeProgramSnapshot,
} from "./read-tour-snapshots";
import type { ProgramDetail } from "@/lib/program/program-types";

const sampleDetail: ProgramDetail = {
  eventId: "evt-1",
  name: "Opening",
  eventImg: "https://example.com/img.jpg",
  date: { dayId: "1", label: "Day 1", date: "2026-01-01" },
  startTime: "10:00",
  endTime: "11:00",
  type: "Other",
  organizer: {
    userId: "u1",
    userName: "Host",
    type: "standard",
    displayNumber: "12",
  },
  coOrganizers: [],
  description: "Hello",
  rsvp: false,
  locationAddress: "Street 1",
};

describe("tour snapshot readers", () => {
  it("normalizes program snapshot and derives list/detail", () => {
    const raw = {
      version: 1 as const,
      capturedAt: "2026-01-01T00:00:00.000Z",
      details: [sampleDetail],
    };

    assert.equal(normalizeProgramSnapshot(raw)?.details.length, 1);
    assert.equal(getProgramListFromSnapshot(raw)?.[0]?.eventId, "evt-1");
    assert.equal(
      getProgramDetailFromSnapshot(raw, "evt-1")?.description,
      "Hello"
    );
    assert.equal(getProgramDetailFromSnapshot(raw, "missing"), null);
    assert.equal(normalizeProgramSnapshot({ version: 2, details: [] }), null);
  });

  it("normalizes exhibitors and hub snapshots", () => {
    const groupedRaw = {
      version: 1 as const,
      capturedAt: "2026-01-01T00:00:00.000Z",
      grouped: {
        standard: [
          {
            type: "standard",
            name: "Studio",
            imageUrl: "/x.jpg",
            displayNumber: "1",
            hubDisplayNumber: null,
            slug: "studio",
          },
        ],
      },
    };

    assert.equal(
      getExhibitorsGroupedFromSnapshot(groupedRaw)?.standard?.[0]?.slug,
      "studio"
    );

    const detailRaw = {
      version: 1 as const,
      capturedAt: "2026-01-01T00:00:00.000Z",
      bySlug: {
        studio: {
          type: "standard",
          slug: "studio",
          userId: "u1",
          name: "Studio",
          imageUrl: "/x.jpg",
          carouselSlides: [],
          displayNumber: "1",
          description: null,
          status: "accepted",
          is_sticky: false,
          is_active: true,
          was_active_last_year: true,
          contactInfo: {
            mapInfo: [],
            phoneNumbers: null,
            visibleEmails: null,
            visibleWebsites: null,
            socialMedia: null,
            visitingHours: null,
            events: [],
          },
          navigation: {
            showMap: false,
            showEvents: false,
            mapHrefs: [],
            eventsHref: null,
          },
        },
      },
    };

    assert.equal(
      getExhibitorDetailFromSnapshot(detailRaw, "studio")?.name,
      "Studio"
    );

    const hubRaw = {
      version: 1 as const,
      capturedAt: "2026-01-01T00:00:00.000Z",
      byHubId: {
        "hub-1": {
          type: "hub",
          hubId: "hub-1",
          name: "Hub",
          hubDisplayNumber: "10",
          description: null,
          mapInfoId: null,
          formattedAddress: null,
          events: [],
          members: [],
        },
      },
    };

    assert.equal(getHubDetailFromSnapshot(hubRaw, "hub-1")?.name, "Hub");
  });

  it("normalizes participant category colors", () => {
    const raw = {
      version: 1 as const,
      capturedAt: "2026-01-01T00:00:00.000Z",
      categories: [
        {
          slug: "standard",
          label: "Standard",
          bgColor: "#aabbcc",
          fontColor: "#000000",
          sortOrder: 1,
          isDefault: true,
          isStructural: false,
          assignable: false,
          showInFilters: true,
        },
      ],
    };

    assert.equal(normalizeParticipantCategoriesSnapshot(raw)?.categories.length, 1);
    const categories = getParticipantCategoriesFromSnapshot(raw);
    assert.equal(categories?.[0]?.bgColor, "#aabbcc");
    assert.equal(categories?.[0]?.slug, "standard");
  });
});
