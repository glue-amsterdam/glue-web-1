/** FNV-1a 32-bit hash for a stable PRNG seed from a string. */
const hashSeed = (seed: string): number => {
  let hash = 0x811c9dc5;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
};

/** Mulberry32 PRNG — deterministic given a 32-bit seed. */
const createSeededRandom = (seed: string): (() => number) => {
  let state = hashSeed(seed);

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Fisher-Yates shuffle; returns a new array without mutating the input.
 * Pass `seed` for a deterministic order (same seed → same permutation).
 */
export const shuffleExhibitors = <T>(items: T[], seed?: string): T[] => {
  const shuffled = [...items];
  const random = seed != null ? createSeededRandom(seed) : Math.random;

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/** UTC calendar day string (YYYY-MM-DD) for daily-stable home exhibitors. */
export const getDailyShuffleSeed = (date: Date = new Date()): string =>
  date.toISOString().slice(0, 10);
