import { normalizeMapAddressLine } from "@/lib/map/utils";
import type {
  ExhibitorContactInfo,
  ExhibitorDetailNavigation,
  ExhibitorMapInfo,
  ExhibitorParticipantDetail,
} from "./exhibitor-detail-types";
import {
  getExhibitorMapHref,
  getExhibitorProgramHref,
} from "./exhibitor-detail-links";
import type { TourStatus } from "./exhibitor-visibility";

const EMPTY_NAVIGATION: ExhibitorDetailNavigation = {
  showMap: false,
  showEvents: false,
  mapHrefs: [],
  eventsHref: null,
};

export type CanLinkExhibitorInput = {
  is_sticky: boolean;
  is_active: boolean;
  was_active_last_year: boolean;
  tourStatus: TourStatus;
};

export const canLinkExhibitorToMapAndEvents = ({
  is_sticky,
  is_active,
  was_active_last_year,
  tourStatus,
}: CanLinkExhibitorInput): boolean => {
  if (is_sticky) {
    return is_active;
  }

  if (tourStatus === "new") {
    return is_active;
  }

  if (tourStatus === "older") {
    return was_active_last_year;
  }

  return false;
};

const isVisibleMapInfo = (map: ExhibitorMapInfo): boolean =>
  !map.no_address && Boolean(map.id) && Boolean(map.formatted_address?.trim());

export const resolveExhibitorVisibleMapInfo = (
  contactInfo: ExhibitorContactInfo
): ExhibitorMapInfo[] => {
  const seenIds = new Set<string>();
  const seenAddresses = new Set<string>();
  const result: ExhibitorMapInfo[] = [];

  const addLocation = (map: ExhibitorMapInfo) => {
    if (!isVisibleMapInfo(map)) return;

    const normalizedAddress = normalizeMapAddressLine(map.formatted_address);
    if (seenIds.has(map.id)) return;
    if (normalizedAddress && seenAddresses.has(normalizedAddress)) return;

    seenIds.add(map.id);
    if (normalizedAddress) {
      seenAddresses.add(normalizedAddress);
    }
    result.push(map);
  };

  for (const map of contactInfo.mapInfo) {
    addLocation(map);
  }

  for (const map of contactInfo.hubLocations ?? []) {
    addLocation(map);
  }

  if (contactInfo.hubHostMapInfoId && contactInfo.hubHostAddress?.trim()) {
    addLocation({
      id: contactInfo.hubHostMapInfoId,
      formatted_address: contactInfo.hubHostAddress,
      no_address: false,
    });
  }

  return result;
};

export const resolveOwnMapInfoId = (
  mapInfo: ExhibitorMapInfo[]
): string | null => {
  const entry = mapInfo.find((map) => !map.no_address && map.id);
  return entry?.id ?? null;
};

export const resolveExhibitorMapInfoId = (
  contactInfo: ExhibitorContactInfo
): string | null => {
  return (
    resolveExhibitorVisibleMapInfo(contactInfo)[0]?.id ??
    contactInfo.hubHostMapInfoId ??
    null
  );
};

export const resolveExhibitorDetailNavigation = (
  participant: Pick<
    ExhibitorParticipantDetail,
    | "name"
    | "is_sticky"
    | "is_active"
    | "was_active_last_year"
    | "contactInfo"
  >,
  tourStatus: TourStatus
): ExhibitorDetailNavigation => {
  if (
    !canLinkExhibitorToMapAndEvents({
      is_sticky: participant.is_sticky,
      is_active: participant.is_active,
      was_active_last_year: participant.was_active_last_year,
      tourStatus,
    })
  ) {
    return EMPTY_NAVIGATION;
  }

  const visibleMapInfo = resolveExhibitorVisibleMapInfo(participant.contactInfo);
  const mapHrefs = visibleMapInfo.map((map) => getExhibitorMapHref(map.id));
  const hasMap = mapHrefs.length > 0;
  const hasEvents = participant.contactInfo.events.length > 0;

  if (!hasMap && !hasEvents) {
    return EMPTY_NAVIGATION;
  }

  const ownAddress = participant.contactInfo.mapInfo.find((map) => !map.no_address)
    ?.formatted_address;

  return {
    showMap: hasMap,
    showEvents: hasEvents,
    mapHrefs,
    eventsHref: hasEvents
      ? getExhibitorProgramHref({
          ownAddress,
          hubHostAddress: participant.contactInfo.hubHostAddress,
          fallbackName: participant.name,
        })
      : null,
  };
};
