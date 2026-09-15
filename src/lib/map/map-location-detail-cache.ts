import type { MapLocationDetail } from "@/lib/map/types";

export type MapLocationDetailCache = Record<string, MapLocationDetail>;

export const getCachedDetail = (
  cache: MapLocationDetailCache,
  id: string | null
): MapLocationDetail | null => {
  if (!id) return null;
  return cache[id] ?? null;
};

export const upsertDetail = (
  cache: MapLocationDetailCache,
  id: string,
  detail: MapLocationDetail
): MapLocationDetailCache => ({
  ...cache,
  [id]: detail,
});

export type ResolveDisplayedDetailInput = {
  cache: MapLocationDetailCache;
  mapInfoId: string | null;
  incoming: MapLocationDetail | null;
};

export type ResolvedDisplayedDetail = {
  detail: MapLocationDetail | null;
  isLoading: boolean;
};

export const resolveDisplayedDetail = ({
  cache,
  mapInfoId,
  incoming,
}: ResolveDisplayedDetailInput): ResolvedDisplayedDetail => {
  if (!mapInfoId) {
    return { detail: null, isLoading: false };
  }

  if (incoming) {
    return { detail: incoming, isLoading: false };
  }

  const cached = getCachedDetail(cache, mapInfoId);
  if (cached) {
    return { detail: cached, isLoading: false };
  }

  return { detail: null, isLoading: true };
};
