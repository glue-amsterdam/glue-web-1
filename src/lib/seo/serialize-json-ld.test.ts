import "./_test-env";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  ExhibitorHubDetail,
  ExhibitorParticipantDetail,
} from "@/lib/participants/exhibitor-detail-types";
import type { ProgramDetail } from "@/lib/program/program-types";
import type { PublicPost } from "@/schemas/postSchema";
import {
  buildExhibitorHubJsonLd,
  buildExhibitorPersonJsonLd,
  buildPostArticleJsonLd,
  buildProgramEventJsonLd,
} from "./build-json-ld";
import { serializeJsonLd } from "./serialize-json-ld";

const VALID_HUB_ID = "c16f973d-30b3-4822-9252-fd8ccc890f7b";

const hubFixture: ExhibitorHubDetail = {
  type: "hub",
  hubId: VALID_HUB_ID,
  name: "Listone Giordano HUB",
  hubDisplayNumber: "1",
  description: "Hub <script>desc</script>",
  mapInfoId: null,
  formattedAddress: null,
  events: [],
  members: [
    {
      userId: "11111111-1111-4111-8111-111111111111",
      slug: "member-one",
      name: "Member One",
      imageUrl: "https://example.test/m.jpg",
      displayNumber: null,
      type: "standard",
    },
  ],
};

const participantFixture: ExhibitorParticipantDetail = {
  type: "standard",
  slug: "studio-example",
  userId: "22222222-2222-4222-8222-222222222222",
  name: "Studio Example",
  imageUrl: "https://example.test/p.jpg",
  carouselSlides: [],
  displayNumber: null,
  description: "Hello",
  status: "accepted",
  is_sticky: false,
  is_active: true,
  was_active_last_year: false,
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
};

const programFixture: ProgramDetail = {
  eventId: "33333333-3333-4333-8333-333333333333",
  name: "Opening Night",
  eventImg: "https://example.test/e.jpg",
  date: { dayId: "d1", label: "Thu", date: "2026-09-17" },
  startTime: "18:00",
  endTime: "21:00",
  type: "opening",
  organizer: {
    userId: "44444444-4444-4444-8444-444444444444",
    userName: "Host",
    slug: "host",
    type: "standard",
    displayNumber: "2",
  },
  coOrganizers: [],
  description: "Program night",
  rsvp: false,
};

const postFixture: PublicPost = {
  id: "55555555-5555-4555-8555-555555555555",
  title: "News item",
  slug: "news-item",
  author: "Editor",
  keywords: ["design"],
  content_html: "<p>Body</p>",
  excerpt: "Body excerpt",
  cover_image_url: null,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-02T00:00:00.000Z",
  media: [],
};

describe("serializeJsonLd", () => {
  it("escapes < to unicode to avoid script breakout", () => {
    const raw = serializeJsonLd({ html: "<script>alert(1)</script>" });
    assert.match(raw, /\\u003cscript/);
    assert.doesNotMatch(raw, /<script/);
  });
});

describe("JSON-LD builders", () => {
  it("buildExhibitorHubJsonLd uses a clean hub URL", () => {
    const jsonLd = buildExhibitorHubJsonLd(hubFixture);
    assert.equal(
      jsonLd.url,
      `https://example.test/exhibitors/hub/${VALID_HUB_ID}`
    );
    assert.doesNotMatch(jsonLd.url, /&quot|\)|%26/);
    assert.equal(jsonLd.member[0]?.url, "https://example.test/exhibitors/member-one");
  });

  it("buildExhibitorPersonJsonLd exposes exhibitor URL shape", () => {
    const jsonLd = buildExhibitorPersonJsonLd(participantFixture);
    assert.equal(jsonLd.url, "https://example.test/exhibitors/studio-example");
    assert.equal(jsonLd["@type"], "Person");
  });

  it("buildProgramEventJsonLd exposes program URL shape", () => {
    const jsonLd = buildProgramEventJsonLd(programFixture);
    assert.equal(
      jsonLd.url,
      "https://example.test/program/33333333-3333-4333-8333-333333333333"
    );
    assert.equal(jsonLd["@type"], "Event");
  });

  it("buildPostArticleJsonLd exposes post URL shape", () => {
    const jsonLd = buildPostArticleJsonLd(postFixture);
    assert.equal(jsonLd.url, "https://example.test/posts/news-item");
    assert.equal(jsonLd["@type"], "BlogPosting");
  });
});
