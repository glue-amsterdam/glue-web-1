import { buildProgramPageUrl } from "@/lib/program/program-url";
import { DEFAULT_PROGRAM_FILTERS } from "@/lib/program/program-filters";

export const getExhibitorMapHref = (
  mapInfoId: string | null | undefined
): string => {
  if (!mapInfoId) {
    return "/map";
  }

  return `/map?place=${encodeURIComponent(mapInfoId)}`;
};

export const getExhibitorProgramHref = (entityName: string): string => {
  const trimmedName = entityName.trim();

  if (!trimmedName) {
    return "/program";
  }

  return buildProgramPageUrl("/program", {
    ...DEFAULT_PROGRAM_FILTERS,
    q: trimmedName,
  });
};
