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
  mapHref: null,
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

export const resolveOwnMapInfoId = (
  mapInfo: ExhibitorMapInfo[]
): string | null => {
  const entry = mapInfo.find((map) => !map.no_address && map.id);
  return entry?.id ?? null;
};

export const resolveExhibitorMapInfoId = (
  contactInfo: ExhibitorContactInfo
): string | null => {
  const ownMapInfoId = resolveOwnMapInfoId(contactInfo.mapInfo);
  if (ownMapInfoId) {
    return ownMapInfoId;
  }

  return contactInfo.hubHostMapInfoId ?? null;
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

  const mapInfoId = resolveExhibitorMapInfoId(participant.contactInfo);
  const hasMap = Boolean(mapInfoId);
  const hasEvents = participant.contactInfo.events.length > 0;

  if (!hasMap && !hasEvents) {
    return EMPTY_NAVIGATION;
  }

  const ownAddress = participant.contactInfo.mapInfo.find((map) => !map.no_address)
    ?.formatted_address;

  return {
    showMap: hasMap,
    showEvents: hasEvents,
    mapHref: hasMap ? getExhibitorMapHref(mapInfoId) : null,
    eventsHref: hasEvents
      ? getExhibitorProgramHref({
          ownAddress,
          hubHostAddress: participant.contactInfo.hubHostAddress,
          fallbackName: participant.name,
        })
      : null,
  };
};
