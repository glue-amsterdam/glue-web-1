"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCachedDetail,
  resolveDisplayedDetail,
  upsertDetail,
  type MapLocationDetailCache,
} from "@/lib/map/map-location-detail-cache";
import type { MapLocationDetail } from "@/lib/map/types";

export const useMapLocationDetail = (
  mapInfoId: string | null,
  enabled: boolean
) => {
  const cacheRef = useRef<MapLocationDetailCache>({});
  const [fetched, setFetched] = useState<{
    id: string;
    detail: MapLocationDetail;
  } | null>(null);
  const [error, setError] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  useEffect(() => {
    if (!mapInfoId || !enabled) {
      setFetched(null);
      setError(false);
      setFetchingId(null);
      return;
    }

    const cached = getCachedDetail(cacheRef.current, mapInfoId);
    if (cached) {
      setFetched({ id: mapInfoId, detail: cached });
      setError(false);
      setFetchingId(null);
    } else {
      setFetchingId(mapInfoId);
    }

    let cancelled = false;
    setError(false);

    fetch(`/api/map/locations/${mapInfoId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch location detail");
        return response.json() as Promise<MapLocationDetail>;
      })
      .then((data) => {
        if (cancelled) return;
        cacheRef.current = upsertDetail(cacheRef.current, mapInfoId, data);
        setFetched({ id: mapInfoId, detail: data });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setFetchingId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [mapInfoId, enabled]);

  const activeId = enabled ? mapInfoId : null;
  const incoming =
    fetched && activeId && fetched.id === activeId ? fetched.detail : null;

  const resolved = resolveDisplayedDetail({
    cache: cacheRef.current,
    mapInfoId: activeId,
    incoming,
  });

  const isLoading =
    Boolean(activeId) &&
    fetchingId === activeId &&
    !resolved.detail;

  return {
    detail: resolved.detail,
    isLoading,
    error,
  };
};
