import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ExhibitorContactInfo } from "./exhibitor-detail-types";
import {
  canLinkExhibitorToMapAndEvents,
  resolveExhibitorDetailNavigation,
  resolveExhibitorMapInfoId,
  resolveOwnMapInfoId,
} from "./exhibitor-detail-navigation";

const baseContactInfo = (
  overrides: Partial<ExhibitorContactInfo> = {}
): ExhibitorContactInfo => ({
  mapInfo: [],
  phoneNumbers: null,
  visibleEmails: null,
  visibleWebsites: null,
  socialMedia: null,
  visitingHours: null,
  events: [],
  ...overrides,
});

const baseParticipant = (
  overrides: Partial<Parameters<typeof resolveExhibitorDetailNavigation>[0]> = {}
) => ({
  name: "Studio Example",
  is_sticky: false,
  is_active: true,
  was_active_last_year: false,
  contactInfo: baseContactInfo(),
  ...overrides,
});

describe("canLinkExhibitorToMapAndEvents", () => {
  it("requires is_active for sticky participants", () => {
    assert.equal(
      canLinkExhibitorToMapAndEvents({
        is_sticky: true,
        is_active: false,
        was_active_last_year: true,
        tourStatus: "older",
      }),
      false
    );
    assert.equal(
      canLinkExhibitorToMapAndEvents({
        is_sticky: true,
        is_active: true,
        was_active_last_year: false,
        tourStatus: "new",
      }),
      true
    );
  });

  it("requires is_active on new tour for non-sticky participants", () => {
    assert.equal(
      canLinkExhibitorToMapAndEvents({
        is_sticky: false,
        is_active: false,
        was_active_last_year: true,
        tourStatus: "new",
      }),
      false
    );
  });

  it("requires was_active_last_year on older tour for non-sticky participants", () => {
    assert.equal(
      canLinkExhibitorToMapAndEvents({
        is_sticky: false,
        is_active: false,
        was_active_last_year: true,
        tourStatus: "older",
      }),
      true
    );
    assert.equal(
      canLinkExhibitorToMapAndEvents({
        is_sticky: false,
        is_active: true,
        was_active_last_year: false,
        tourStatus: "older",
      }),
      false
    );
  });
});

describe("resolveExhibitorMapInfoId", () => {
  it("prefers own map info over hub host map info", () => {
    assert.equal(
      resolveExhibitorMapInfoId(
        baseContactInfo({
          mapInfo: [
            {
              id: "own-map",
              formatted_address: "Via Roma 1",
              no_address: false,
            },
          ],
          hubHostMapInfoId: "hub-map",
        })
      ),
      "own-map"
    );
  });

  it("falls back to hub host map info when participant has no address", () => {
    assert.equal(
      resolveExhibitorMapInfoId(
        baseContactInfo({
          mapInfo: [],
          hubHostMapInfoId: "hub-map",
        })
      ),
      "hub-map"
    );
  });

  it("ignores map info rows marked as no_address", () => {
    assert.equal(
      resolveOwnMapInfoId([
        {
          id: "hidden-map",
          formatted_address: "",
          no_address: true,
        },
      ]),
      null
    );
  });
});

describe("resolveExhibitorDetailNavigation", () => {
  it("hides buttons for inactive sticky participants even with data", () => {
    const navigation = resolveExhibitorDetailNavigation(
      baseParticipant({
        is_sticky: true,
        is_active: false,
        contactInfo: baseContactInfo({
          mapInfo: [
            {
              id: "map-1",
              formatted_address: "Via Roma 1",
              no_address: false,
            },
          ],
          events: [{ id: "event-1", image_url: "", title: "Opening" }],
        }),
      }),
      "new"
    );

    assert.deepEqual(navigation, {
      showMap: false,
      showEvents: false,
      mapHref: null,
      eventsHref: null,
    });
  });

  it("shows buttons on older tour when participant was active last year", () => {
    const navigation = resolveExhibitorDetailNavigation(
      baseParticipant({
        is_active: false,
        was_active_last_year: true,
        contactInfo: baseContactInfo({
          mapInfo: [
            {
              id: "map-1",
              formatted_address: "Via Roma 1",
              no_address: false,
            },
          ],
          events: [{ id: "event-1", image_url: "", title: "Opening" }],
        }),
      }),
      "older"
    );

    assert.equal(navigation.showMap, true);
    assert.equal(navigation.showEvents, true);
    assert.equal(navigation.mapHref, "/map?place=map-1");
    assert.match(navigation.eventsHref ?? "", /\/program\?/);
  });

  it("shows only map for hub member without own address", () => {
    const navigation = resolveExhibitorDetailNavigation(
      baseParticipant({
        contactInfo: baseContactInfo({
          hubHostAddress: "Via Milano 10",
          hubHostMapInfoId: "hub-map-id",
        }),
      }),
      "new"
    );

    assert.deepEqual(navigation, {
      showMap: true,
      showEvents: false,
      mapHref: "/map?place=hub-map-id",
      eventsHref: null,
    });
  });

  it("hides map when only hub host address exists without map info id", () => {
    const navigation = resolveExhibitorDetailNavigation(
      baseParticipant({
        contactInfo: baseContactInfo({
          hubHostAddress: "Via Milano 10",
          hubHostMapInfoId: null,
        }),
      }),
      "new"
    );

    assert.deepEqual(navigation, {
      showMap: false,
      showEvents: false,
      mapHref: null,
      eventsHref: null,
    });
  });

  it("shows only events when participant has events but no map placement", () => {
    const navigation = resolveExhibitorDetailNavigation(
      baseParticipant({
        contactInfo: baseContactInfo({
          events: [{ id: "event-1", image_url: "", title: "Talk" }],
        }),
      }),
      "new"
    );

    assert.equal(navigation.showMap, false);
    assert.equal(navigation.showEvents, true);
    assert.equal(navigation.mapHref, null);
    assert.match(navigation.eventsHref ?? "", /\/program\?/);
  });
});
