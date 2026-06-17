"use client";

import { useEffect, useState } from "react";
import type { MapLocationDetail } from "@/lib/map/types";

export const useMapLocationDetail = (
  mapInfoId: string | null,
  enabled: boolean
) => {
  const [detail, setDetail] = useState<MapLocationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapInfoId || !enabled) {
      setDetail(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setDetail(null);
    setIsLoading(true);
    setError(false);

    fetch(`/api/map/locations/${mapInfoId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch location detail");
        return response.json() as Promise<MapLocationDetail>;
      })
      .then((data) => {
        if (!cancelled) setDetail(data);
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
  }, [mapInfoId, enabled]);

  return { detail, isLoading, error };
};
