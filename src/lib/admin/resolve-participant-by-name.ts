import type { StickyParticipantCatalogRow } from "@/lib/admin/fetch-sticky-participant-catalog";
import {
  getSearchableNameFields,
  normalizeLooseMatchText,
  normalizeTokenText,
  tokenizeWords,
} from "@/lib/admin/parse-sticky-participants-by-name";

const normalizeField = (value: string | null | undefined) => {
  if (!value?.trim()) return null;
  return normalizeTokenText(value);
};

const getParticipantLabel = (participant: StickyParticipantCatalogRow) => {
  const displayName = participant.display_name?.trim();
  const userName = participant.user_name?.trim();

  if (displayName && userName && displayName !== userName) {
    return `${displayName} (${userName})`;
  }

  return participant.name;
};

const findExactOnField = (
  catalog: StickyParticipantCatalogRow[],
  normalizedName: string,
  field: "display_name" | "user_name" | "name"
) =>
  catalog.filter((participant) => {
    const value = normalizeField(participant[field]);
    return value === normalizedName;
  });

const findUniquePartialOnField = (
  catalog: StickyParticipantCatalogRow[],
  normalizedName: string,
  field: "display_name" | "user_name"
) => {
  if (normalizedName.length < 3) return [];

  return catalog.filter((participant) => {
    const value = normalizeField(participant[field]);
    if (!value) return false;
    return value.includes(normalizedName);
  });
};

const allWordsMatchInField = (fieldText: string, words: string[]) =>
  words.every((word) => fieldText.includes(word));

export const findAllWordsMatches = (
  name: string,
  catalog: StickyParticipantCatalogRow[]
): StickyParticipantCatalogRow[] => {
  const words = tokenizeWords(name);
  if (words.length === 0) return [];

  return catalog.filter((participant) =>
    getSearchableNameFields(participant).some((field) =>
      allWordsMatchInField(field, words)
    )
  );
};

const countSharedWords = (left: string, right: string) => {
  const leftWords = new Set(tokenizeWords(left));
  const rightWords = tokenizeWords(right);

  if (leftWords.size === 0 || rightWords.length === 0) return 0;

  return rightWords.filter((word) => leftWords.has(word)).length;
};

export const suggestClosestNames = (
  token: string,
  catalog: StickyParticipantCatalogRow[],
  limit = 3
): string[] => {
  const normalizedToken = normalizeLooseMatchText(token);
  if (!normalizedToken) return [];

  const scored = catalog
    .map((participant) => {
      const label = getParticipantLabel(participant);
      const fields = getSearchableNameFields(participant);
      const sharedWords = Math.max(
        ...fields.map((field) => countSharedWords(normalizedToken, field)),
        countSharedWords(normalizedToken, label)
      );

      return { label, sharedWords };
    })
    .filter((entry) => entry.sharedWords > 0)
    .sort((a, b) => b.sharedWords - a.sharedWords);

  const uniqueLabels: string[] = [];

  for (const entry of scored) {
    if (uniqueLabels.includes(entry.label)) continue;
    uniqueLabels.push(entry.label);
    if (uniqueLabels.length >= limit) break;
  }

  return uniqueLabels;
};

export const findParticipantsByName = (
  name: string,
  catalog: StickyParticipantCatalogRow[]
): StickyParticipantCatalogRow[] => {
  const trimmed = name.trim();
  if (!trimmed) return [];

  const normalizedName = normalizeTokenText(trimmed);

  for (const field of ["display_name", "user_name", "name"] as const) {
    const exact = findExactOnField(catalog, normalizedName, field);
    if (exact.length === 1) return exact;
    if (exact.length > 1) return exact;
  }

  for (const field of ["display_name", "user_name"] as const) {
    const partial = findUniquePartialOnField(catalog, normalizedName, field);
    if (partial.length === 1) return partial;
    if (partial.length > 1) return partial;
  }

  const allWordsMatches = findAllWordsMatches(trimmed, catalog);
  if (allWordsMatches.length >= 1) return allWordsMatches;

  return [];
};

