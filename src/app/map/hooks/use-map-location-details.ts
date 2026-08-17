"use client";

import { useEffect, useMemo, useState } from "react";
import type { MapLocationDetail } from "@/lib/map/types";

const EMPTY_DETAILS = new Map<string, MapLocationDetail>();

const toUniqueSortedIds = (mapInfoIds: string[]) => {
  const uniqueIds = [...new Set(mapInfoIds.filter(Boolean))];
  uniqueIds.sort();
  return uniqueIds;
};

export const useMapLocationDetails = (
  mapInfoIds: string[],
  enabled: boolean
) => {
  const idsKey = useMemo(
    () => toUniqueSortedIds(mapInfoIds).join(","),
    [mapInfoIds]
  );

  const [detailsById, setDetailsById] =
    useState<Map<string, MapLocationDetail>>(EMPTY_DETAILS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const uniqueIds = idsKey ? idsKey.split(",") : [];

    if (!enabled || uniqueIds.length === 0) {
      setDetailsById(EMPTY_DETAILS);
      setIsLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setDetailsById(EMPTY_DETAILS);
    setIsLoading(true);
    setError(false);

    Promise.all(
      uniqueIds.map(async (id) => {
        const response = await fetch(`/api/map/locations/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch location detail: ${id}`);
        }
        const detail = (await response.json()) as MapLocationDetail;
        return [id, detail] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        setDetailsById(new Map(entries));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, idsKey]);

  return { detailsById, isLoading, error };
};
