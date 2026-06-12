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

export type ResolveExhibitorProgramSearchTermInput = {
  ownAddress?: string | null;
  hubHostAddress?: string | null;
  fallbackName?: string;
};

export const resolveExhibitorProgramSearchTerm = ({
  ownAddress,
  hubHostAddress,
  fallbackName,
}: ResolveExhibitorProgramSearchTermInput): string => {
  const normalizedOwnAddress = ownAddress?.trim();
  if (normalizedOwnAddress) {
    return normalizedOwnAddress;
  }

  const normalizedHubHostAddress = hubHostAddress?.trim();
  if (normalizedHubHostAddress) {
    return normalizedHubHostAddress;
  }

  return fallbackName?.trim() ?? "";
};

export const getExhibitorProgramHref = (
  searchTermOrOptions: string | ResolveExhibitorProgramSearchTermInput
): string => {
  const trimmedSearchTerm =
    typeof searchTermOrOptions === "string"
      ? searchTermOrOptions.trim()
      : resolveExhibitorProgramSearchTerm(searchTermOrOptions);

  if (!trimmedSearchTerm) {
    return "/program";
  }

  return buildProgramPageUrl("/program", {
    ...DEFAULT_PROGRAM_FILTERS,
    q: trimmedSearchTerm,
  });
};
