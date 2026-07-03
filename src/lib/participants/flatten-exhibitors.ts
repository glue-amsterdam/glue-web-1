import type {
  ExhibitorItem,
  ExhibitorsGroupedResponse,
} from "./exhibitor-types";

export const flattenExhibitors = (
  grouped: ExhibitorsGroupedResponse
): ExhibitorItem[] => Object.values(grouped).flat();

export const createEmptyGroupedExhibitors = (
  categorySlugs: string[]
): ExhibitorsGroupedResponse => {
  const grouped: ExhibitorsGroupedResponse = {};
  for (const slug of categorySlugs) {
    grouped[slug] = [];
  }
  return grouped;
};
