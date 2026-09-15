"use client";

import { useEffect } from "react";
import { useMapFiltersFromUrl } from "@/hooks/useMapFiltersFromUrl";
import { buildEarlyHydratorPageListsPatch } from "@/lib/map/map-page-lists";
import type { MapPageData } from "@/lib/map/types";
import { useMapStore } from "./stores/use-map-store";

type MapStoreEarlyHydratorProps = {
  initialData: MapPageData;
};

const MapStoreEarlyHydrator = ({ initialData }: MapStoreEarlyHydratorProps) => {
  const { filters } = useMapFiltersFromUrl();
  const setPage = useMapStore((state) => state.setPage);

  useEffect(() => {
    setPage(buildEarlyHydratorPageListsPatch(initialData, filters));
  }, [initialData, filters, setPage]);

  return null;
};

export default MapStoreEarlyHydrator;
