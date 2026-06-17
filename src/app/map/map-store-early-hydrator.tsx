"use client";

import { useEffect } from "react";
import { useMapFiltersFromUrl } from "@/hooks/useMapFiltersFromUrl";
import {
  filterMapLocationsForList,
  filterMapLocationsForSearch,
  filterMapRoutes,
} from "@/lib/map/map-filters";
import type { MapPageData } from "@/lib/map/types";
import { useMapStore } from "./stores/use-map-store";

type MapStoreEarlyHydratorProps = {
  initialData: MapPageData;
};

const MapStoreEarlyHydrator = ({ initialData }: MapStoreEarlyHydratorProps) => {
  const { filters } = useMapFiltersFromUrl();
  const setPage = useMapStore((state) => state.setPage);

  useEffect(() => {
    setPage({
      routes: initialData.routes,
      filteredLocationsForList: filterMapLocationsForList(
        initialData.locations,
        filters
      ),
      searchFilteredLocations: filterMapLocationsForSearch(
        initialData.locations,
        filters.q
      ),
      filteredRoutesForList: filterMapRoutes(initialData.routes, filters.q),
      selectedLocation: null,
      selectedRoute: null,
      onLocationSelect: () => { },
      onRouteSelect: () => { },
    });
  }, [initialData, filters, setPage]);

  return null;
};

export default MapStoreEarlyHydrator;
