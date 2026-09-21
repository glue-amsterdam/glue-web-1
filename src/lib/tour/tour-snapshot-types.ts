import type {
  ExhibitorHubDetail,
  ExhibitorParticipantDetail,
} from "@/lib/participants/exhibitor-detail-types";
import type { ExhibitorsGroupedResponse } from "@/lib/participants/exhibitor-types";
import type { ParticipantCategory } from "@/lib/participants/participant-categories";
import type { ProgramDetail, ProgramListItem } from "@/lib/program/program-types";

export type TourParticipantCategorySnapshotItem = {
  slug: string;
  label: string;
  bgColor: string;
  fontColor: string;
  sortOrder: number;
  isDefault: boolean;
  isStructural: boolean;
  assignable: boolean;
  showInFilters: boolean;
};

export type TourParticipantCategoriesSnapshot = {
  version: 1;
  capturedAt: string;
  categories: TourParticipantCategorySnapshotItem[];
};

export type TourProgramSnapshot = {
  version: 1;
  capturedAt: string;
  details: ProgramDetail[];
};

export type TourExhibitorsGroupedSnapshot = {
  version: 1;
  capturedAt: string;
  grouped: ExhibitorsGroupedResponse;
};

export type TourExhibitorDetailsSnapshot = {
  version: 1;
  capturedAt: string;
  bySlug: Record<string, ExhibitorParticipantDetail>;
};

export type TourHubDetailsSnapshot = {
  version: 1;
  capturedAt: string;
  byHubId: Record<string, ExhibitorHubDetail>;
};

export type BuiltTourContentSnapshots = {
  program: TourProgramSnapshot;
  exhibitorsGrouped: TourExhibitorsGroupedSnapshot;
  exhibitorDetails: TourExhibitorDetailsSnapshot;
  hubDetails: TourHubDetailsSnapshot;
  participantCategories: TourParticipantCategoriesSnapshot;
};

export const programDetailToListItem = (
  detail: ProgramDetail
): ProgramListItem => ({
  eventId: detail.eventId,
  name: detail.name,
  eventImg: detail.eventImg,
  date: detail.date,
  startTime: detail.startTime,
  endTime: detail.endTime,
  type: detail.type,
  organizer: detail.organizer,
  coOrganizers: detail.coOrganizers,
  ...(detail.locationAddress
    ? { locationAddress: detail.locationAddress }
    : detail.location?.formattedAddress
      ? { locationAddress: detail.location.formattedAddress }
      : {}),
});

export const categoryToSnapshotItem = (
  category: ParticipantCategory
): TourParticipantCategorySnapshotItem => ({
  slug: category.slug,
  label: category.label,
  bgColor: category.bgColor,
  fontColor: category.fontColor,
  sortOrder: category.sortOrder,
  isDefault: category.isDefault,
  isStructural: category.isStructural,
  assignable: category.assignable,
  showInFilters: category.showInFilters,
});

export const snapshotItemToCategory = (
  item: TourParticipantCategorySnapshotItem,
  index: number
): ParticipantCategory => ({
  id: `snapshot-${item.slug}-${index}`,
  slug: item.slug,
  label: item.label,
  bgColor: item.bgColor,
  fontColor: item.fontColor,
  sortOrder: item.sortOrder,
  isDefault: item.isDefault,
  isStructural: item.isStructural,
  assignable: item.assignable,
  showInFilters: item.showInFilters,
  isProtected: false,
});
