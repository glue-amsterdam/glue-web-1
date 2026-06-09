import type { SupabaseClient } from "@supabase/supabase-js";
import type { StickyParticipantCatalogRow } from "@/lib/admin/fetch-sticky-participant-catalog";
import { fetchStickyParticipantCatalog } from "@/lib/admin/fetch-sticky-participant-catalog";
import type { StickyUserCatalogRow } from "@/lib/admin/fetch-sticky-user-catalog";
import { fetchStickyUserCatalog } from "@/lib/admin/fetch-sticky-user-catalog";
import { normalizeStickyDisplayNameKey } from "@/types/sticky-member";
import type { StickyGroupMemberInput } from "@/types/sticky-member";
import {
  findParticipantsByName,
  suggestClosestNames,
  type ResolveByNameCandidate,
  type ResolveByNameEntry,
} from "@/lib/admin/resolve-participant-by-name";

export type ResolveStickyMembersByNamesResult = {
  matchedUsers: StickyUserCatalogRow[];
  displayNameOnly: string[];
  ambiguous: ResolveByNameEntry[];
  alreadySelected: string[];
  suggestions: Record<string, string[]>;
};

type NameResolution =
  | { kind: "matched_user"; user: StickyUserCatalogRow }
  | { kind: "display_name_only"; name: string }
  | { kind: "ambiguous"; entry: ResolveByNameEntry }
  | { kind: "already_selected"; name: string };

const toParticipantShape = (
  user: StickyUserCatalogRow
): StickyParticipantCatalogRow => ({
  user_id: user.user_id,
  slug: user.slug ?? "",
  display_name: user.display_name,
  display_number: null,
  user_name: user.user_name,
  name: user.name,
  status: user.entity_type === "participant" ? "participant" : "visitor",
});

const toCandidate = (user: StickyUserCatalogRow): ResolveByNameCandidate => ({
  user_id: user.user_id,
  name: user.name,
  slug: user.slug ?? "",
  display_name: user.display_name,
  user_name: user.user_name,
});

const resolveSingleStickyName = (
  rawName: string,
  participantCatalog: StickyParticipantCatalogRow[],
  userCatalog: StickyUserCatalogRow[],
  selectedUserIds: Set<string>,
  selectedDisplayNameKeys: Set<string>,
  addedUserIds: Set<string>,
  addedDisplayNameKeys: Set<string>
): NameResolution => {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return { kind: "display_name_only", name: trimmed };
  }

  const participantMatches = findParticipantsByName(trimmed, participantCatalog);
  if (participantMatches.length > 1) {
    return {
      kind: "ambiguous",
      entry: {
        name: trimmed,
        reason: "ambiguous",
        candidates: participantMatches.map((match) => ({
          user_id: match.user_id,
          name: match.name,
          slug: match.slug,
          display_name: match.display_name,
          user_name: match.user_name,
        })),
      },
    };
  }

  if (participantMatches.length === 1) {
    const match = participantMatches[0];
    const user =
      userCatalog.find((entry) => entry.user_id === match.user_id) ??
      ({
        user_id: match.user_id,
        name: match.name,
        display_name: match.display_name,
        user_name: match.user_name,
        entity_type: "participant",
        slug: match.slug,
      } satisfies StickyUserCatalogRow);

    if (
      selectedUserIds.has(user.user_id) ||
      addedUserIds.has(user.user_id)
    ) {
      return { kind: "already_selected", name: trimmed };
    }

    return { kind: "matched_user", user };
  }

  const userMatches = findParticipantsByName(
    trimmed,
    userCatalog.map(toParticipantShape)
  );

  if (userMatches.length > 1) {
    const candidates = userMatches
      .map((match) => userCatalog.find((user) => user.user_id === match.user_id))
      .filter((user): user is StickyUserCatalogRow => Boolean(user));

    return {
      kind: "ambiguous",
      entry: {
        name: trimmed,
        reason: "ambiguous",
        candidates: candidates.map(toCandidate),
      },
    };
  }

  if (userMatches.length === 1) {
    const user = userCatalog.find(
      (entry) => entry.user_id === userMatches[0].user_id
    );

    if (!user) {
      return { kind: "display_name_only", name: trimmed };
    }

    if (selectedUserIds.has(user.user_id) || addedUserIds.has(user.user_id)) {
      return { kind: "already_selected", name: trimmed };
    }

    return { kind: "matched_user", user };
  }

  const displayKey = normalizeStickyDisplayNameKey(trimmed);
  if (
    selectedDisplayNameKeys.has(displayKey) ||
    addedDisplayNameKeys.has(displayKey)
  ) {
    return { kind: "already_selected", name: trimmed };
  }

  return { kind: "display_name_only", name: trimmed };
};

export const resolveStickyMembersByNames = (
  names: string[],
  participantCatalog: StickyParticipantCatalogRow[],
  userCatalog: StickyUserCatalogRow[],
  selectedUserIds: string[] = [],
  selectedDisplayNameKeys: string[] = []
): ResolveStickyMembersByNamesResult => {
  const selectedUserSet = new Set(selectedUserIds);
  const selectedDisplaySet = new Set(selectedDisplayNameKeys);
  const addedUserIds = new Set<string>();
  const addedDisplayNameKeys = new Set<string>();

  const matchedUsers: StickyUserCatalogRow[] = [];
  const displayNameOnly: string[] = [];
  const ambiguous: ResolveByNameEntry[] = [];
  const alreadySelected: string[] = [];
  const suggestions: Record<string, string[]> = {};

  for (const name of names) {
    const result = resolveSingleStickyName(
      name,
      participantCatalog,
      userCatalog,
      selectedUserSet,
      selectedDisplaySet,
      addedUserIds,
      addedDisplayNameKeys
    );

    if (result.kind === "matched_user") {
      matchedUsers.push(result.user);
      addedUserIds.add(result.user.user_id);
      continue;
    }

    if (result.kind === "display_name_only") {
      const trimmed = result.name.trim();
      if (!trimmed) continue;

      displayNameOnly.push(trimmed);
      addedDisplayNameKeys.add(normalizeStickyDisplayNameKey(trimmed));
      continue;
    }

    if (result.kind === "ambiguous") {
      ambiguous.push(result.entry);
      continue;
    }

    if (result.kind === "already_selected") {
      alreadySelected.push(result.name);
    }
  }

  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const resolved =
      matchedUsers.some((user) => user.name === trimmed) ||
      displayNameOnly.some(
        (entry) =>
          normalizeStickyDisplayNameKey(entry) ===
          normalizeStickyDisplayNameKey(trimmed)
      ) ||
      ambiguous.some((entry) => entry.name === trimmed) ||
      alreadySelected.includes(trimmed);

    if (resolved) continue;

    const closest = suggestClosestNames(
      trimmed,
      userCatalog.map(toParticipantShape)
    );

    if (closest.length > 0) {
      suggestions[trimmed] = closest;
    }
  }

  return {
    matchedUsers,
    displayNameOnly,
    ambiguous,
    alreadySelected,
    suggestions,
  };
};

export const mergeMembersWithResolvedNames = async (
  supabase: SupabaseClient,
  members: StickyGroupMemberInput[] | undefined,
  memberNames: string[] | undefined
): Promise<
  | { ok: true; members: StickyGroupMemberInput[] }
  | {
      ok: false;
      ambiguous: ResolveByNameEntry[];
      suggestions: Record<string, string[]>;
    }
> => {
  const existing = members ?? [];
  const names = (memberNames ?? []).map((name) => name.trim()).filter(Boolean);

  if (names.length === 0) {
    return { ok: true, members: existing };
  }

  const [participantCatalog, userCatalog] = await Promise.all([
    fetchStickyParticipantCatalog(supabase),
    fetchStickyUserCatalog(supabase),
  ]);

  const selectedUserIds = existing
    .map((member) => member.user_id)
    .filter((userId): userId is string => Boolean(userId));

  const selectedDisplayNameKeys = existing
    .map((member) => member.display_name_only)
    .filter((name): name is string => Boolean(name?.trim()))
    .map((name) => normalizeStickyDisplayNameKey(name));

  const resolution = resolveStickyMembersByNames(
    names,
    participantCatalog,
    userCatalog,
    selectedUserIds,
    selectedDisplayNameKeys
  );

  if (resolution.ambiguous.length > 0) {
    return {
      ok: false,
      ambiguous: resolution.ambiguous,
      suggestions: resolution.suggestions,
    };
  }

  const merged = [...existing];
  const mergedUserIds = new Set(
    existing.map((member) => member.user_id).filter(Boolean) as string[]
  );
  const mergedDisplayKeys = new Set(
    existing
      .map((member) => member.display_name_only)
      .filter((name): name is string => Boolean(name?.trim()))
      .map((name) => normalizeStickyDisplayNameKey(name))
  );

  for (const user of resolution.matchedUsers) {
    if (mergedUserIds.has(user.user_id)) continue;

    merged.push({
      user_id: user.user_id,
      is_curated: true,
    });
    mergedUserIds.add(user.user_id);
  }

  for (const name of resolution.displayNameOnly) {
    const key = normalizeStickyDisplayNameKey(name);
    if (mergedDisplayKeys.has(key)) continue;

    merged.push({
      display_name_only: name,
      is_curated: true,
    });
    mergedDisplayKeys.add(key);
  }

  return { ok: true, members: merged };
};
