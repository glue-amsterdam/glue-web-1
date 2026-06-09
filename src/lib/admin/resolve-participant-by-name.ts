import type { SupabaseClient } from "@supabase/supabase-js";
import type { StickyParticipantCatalogRow } from "@/lib/admin/fetch-sticky-participant-catalog";
import { fetchStickyParticipantCatalog } from "@/lib/admin/fetch-sticky-participant-catalog";
import {
  getSearchableNameFields,
  normalizeLooseMatchText,
  normalizeTokenText,
  tokenizeWords,
} from "@/lib/admin/parse-sticky-participants-by-name";

export type ResolveByNameReason =
  | "matched"
  | "not_found"
  | "ambiguous"
  | "already_selected";

export type ResolveByNameCandidate = {
  user_id: string;
  name: string;
  slug: string;
  display_name: string | null;
  user_name: string | null;
};

export type ResolveByNameEntry = {
  name: string;
  reason: ResolveByNameReason;
  user_id?: string;
  slug?: string;
  display_name?: string | null;
  user_name?: string | null;
  label?: string;
  candidates?: ResolveByNameCandidate[];
};

export type ResolveParticipantsByNamesResult = {
  resolved: ResolveByNameEntry[];
  matched: StickyParticipantCatalogRow[];
  notFound: string[];
  ambiguous: ResolveByNameEntry[];
  alreadySelected: string[];
  suggestions: Record<string, string[]>;
};

const normalizeField = (value: string | null | undefined) => {
  if (!value?.trim()) return null;
  return normalizeTokenText(value);
};

const toCandidate = (
  participant: StickyParticipantCatalogRow
): ResolveByNameCandidate => ({
  user_id: participant.user_id,
  name: participant.name,
  slug: participant.slug,
  display_name: participant.display_name,
  user_name: participant.user_name,
});

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

const finalizeMatch = (
  name: string,
  matches: StickyParticipantCatalogRow[],
  selectedUserIds: Set<string>,
  addedUserIds: Set<string>
): ResolveByNameEntry => {
  if (matches.length === 0) {
    return { name, reason: "not_found" };
  }

  if (matches.length > 1) {
    return {
      name,
      reason: "ambiguous",
      candidates: matches.map(toCandidate),
    };
  }

  const match = matches[0];

  if (selectedUserIds.has(match.user_id) || addedUserIds.has(match.user_id)) {
    return {
      name,
      reason: "already_selected",
      user_id: match.user_id,
      slug: match.slug,
      display_name: match.display_name,
      user_name: match.user_name,
      label: match.name,
    };
  }

  return {
    name,
    reason: "matched",
    user_id: match.user_id,
    slug: match.slug,
    display_name: match.display_name,
    user_name: match.user_name,
    label: match.name,
  };
};

const resolveSingleName = (
  name: string,
  catalog: StickyParticipantCatalogRow[],
  selectedUserIds: Set<string>,
  addedUserIds: Set<string>
): ResolveByNameEntry => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { name: trimmed, reason: "not_found" };
  }

  const matches = findParticipantsByName(trimmed, catalog);
  return finalizeMatch(trimmed, matches, selectedUserIds, addedUserIds);
};

export const resolveParticipantsByNames = (
  names: string[],
  catalog: StickyParticipantCatalogRow[],
  selectedUserIds: string[] = []
): ResolveParticipantsByNamesResult => {
  const selectedSet = new Set(selectedUserIds);
  const addedSet = new Set<string>();

  const resolved: ResolveByNameEntry[] = [];
  const matched: StickyParticipantCatalogRow[] = [];
  const notFound: string[] = [];
  const ambiguous: ResolveByNameEntry[] = [];
  const alreadySelected: string[] = [];
  const suggestions: Record<string, string[]> = {};

  for (const name of names) {
    const result = resolveSingleName(name, catalog, selectedSet, addedSet);
    resolved.push(result);

    if (result.reason === "matched" && result.user_id) {
      const participant = catalog.find((row) => row.user_id === result.user_id);
      if (participant) {
        matched.push(participant);
        addedSet.add(participant.user_id);
      }
      continue;
    }

    if (result.reason === "not_found") {
      notFound.push(result.name);
      const closest = suggestClosestNames(result.name, catalog);
      if (closest.length > 0) {
        suggestions[result.name] = closest;
      }
      continue;
    }

    if (result.reason === "ambiguous") {
      ambiguous.push(result);
      continue;
    }

    if (result.reason === "already_selected") {
      alreadySelected.push(result.name);
    }
  }

  return {
    resolved,
    matched,
    notFound,
    ambiguous,
    alreadySelected,
    suggestions,
  };
};

export type StickyGroupParticipantInput = {
  user_id: string;
  is_curated?: boolean;
};

export const mergeParticipantsWithResolvedNames = async (
  supabase: SupabaseClient,
  participants: StickyGroupParticipantInput[] | undefined,
  participantNames: string[] | undefined
): Promise<
  | { ok: true; participants: StickyGroupParticipantInput[] }
  | {
      ok: false;
      notFound: string[];
      ambiguous: ResolveByNameEntry[];
      suggestions: Record<string, string[]>;
    }
> => {
  const existing = participants ?? [];
  const names = (participantNames ?? []).map((name) => name.trim()).filter(Boolean);

  if (names.length === 0) {
    return { ok: true, participants: existing };
  }

  const catalog = await fetchStickyParticipantCatalog(supabase);
  const selectedUserIds = existing.map((participant) => participant.user_id);
  const resolution = resolveParticipantsByNames(names, catalog, selectedUserIds);

  if (resolution.notFound.length > 0 || resolution.ambiguous.length > 0) {
    return {
      ok: false,
      notFound: resolution.notFound,
      ambiguous: resolution.ambiguous,
      suggestions: resolution.suggestions,
    };
  }

  const merged = [...existing];
  const mergedIds = new Set(existing.map((participant) => participant.user_id));

  for (const participant of resolution.matched) {
    if (mergedIds.has(participant.user_id)) continue;

    merged.push({
      user_id: participant.user_id,
      is_curated: true,
    });
    mergedIds.add(participant.user_id);
  }

  return { ok: true, participants: merged };
};
