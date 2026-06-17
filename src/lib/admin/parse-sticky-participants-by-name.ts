export type StickyParticipantLookup = {
  user_id: string;
  name: string;
  slug: string;
  display_name?: string | null;
  user_name?: string | null;
  display_number?: string | null;
  status: string;
  sticky_years: number[];
};

const TYPOGRAPHIC_QUOTE_MAP: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u00AB": '"',
  "\u00BB": '"',
  "\uFF0C": ",",
  "\u2013": "-",
  "\u2014": "-",
};

const normalizeUnicode = (value: string) => {
  let normalized = value.normalize("NFKC");

  for (const [from, to] of Object.entries(TYPOGRAPHIC_QUOTE_MAP)) {
    normalized = normalized.split(from).join(to);
  }

  return normalized;
};

export const foldDiacritics = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "");

export const normalizeTokenText = (value: string) =>
  foldDiacritics(normalizeUnicode(value))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const normalizeLooseMatchText = (value: string) =>
  normalizeTokenText(value)
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const tokenizeWords = (value: string): string[] => {
  const loose = normalizeLooseMatchText(value);
  if (!loose) return [];

  return loose.split(/\s+/).filter((word) => word.length > 0);
};

export const getSearchableNameFields = (participant: {
  display_name?: string | null;
  user_name?: string | null;
  name?: string | null;
}) => {
  const fields: string[] = [];

  for (const raw of [participant.display_name, participant.user_name, participant.name]) {
    if (!raw?.trim()) continue;
    fields.push(normalizeLooseMatchText(raw));
  }

  return [...new Set(fields)];
};

const slugAsSpaced = (slug: string) => slug.replace(/-/g, " ");

export const getParticipantMatchKeys = (
  participant: Pick<
    StickyParticipantLookup,
    "name" | "slug" | "display_name" | "user_name" | "display_number"
  >,
  options?: { includeDisplayNumber?: boolean; includeLoose?: boolean }
): string[] => {
  const keys = new Set<string>();
  const includeDisplayNumber = options?.includeDisplayNumber ?? true;
  const includeLoose = options?.includeLoose ?? true;

  const rawValues = [
    participant.name,
    participant.display_name,
    participant.user_name,
    includeDisplayNumber ? participant.display_number : null,
    participant.slug,
    participant.slug ? slugAsSpaced(participant.slug) : null,
  ];

  for (const raw of rawValues) {
    if (!raw?.trim()) continue;

    keys.add(normalizeTokenText(raw));

    if (includeLoose) {
      const loose = normalizeLooseMatchText(raw);
      if (loose) keys.add(loose);
    }
  }

  return [...keys];
};

export const getParticipantPartialMatchKeys = (
  participant: Pick<
    StickyParticipantLookup,
    "name" | "slug" | "display_name" | "user_name"
  >
): string[] => getParticipantMatchKeys(participant, { includeDisplayNumber: false });

export const matchesDisplayNameQuery = (
  participant: Pick<
    StickyParticipantLookup,
    "name" | "slug" | "display_name" | "user_name" | "display_number"
  >,
  query: string
) => {
  const normalizedQuery = normalizeTokenText(query);
  const looseQuery = normalizeLooseMatchText(query);
  if (!normalizedQuery) return false;

  return getParticipantMatchKeys(participant).some((key) => {
    if (key.includes(normalizedQuery)) return true;
    if (looseQuery && key.includes(looseQuery)) return true;
    return false;
  });
};
