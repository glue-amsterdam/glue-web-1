import type {
  ExhibitorItem,
  ExhibitorsGroupedResponse,
} from "./exhibitor-types";

export const flattenExhibitors = (
  grouped: ExhibitorsGroupedResponse
): ExhibitorItem[] => [
  ...grouped.specialProgram,
  ...grouped.upToThreeParticipants,
  ...grouped.hubs,
];
