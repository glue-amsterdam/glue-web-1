import {
  filterMapLocationsForList,
  filterMapLocationsForSearch,
  filterMapRoutes,
  type MapFilters,
} from "@/lib/map/map-filters";
import type { MapLocation, MapPageData, MapRoute } from "@/lib/map/types";

export type MapPageListsPatch = {
  routes: MapRoute[];
  filteredLocationsForList: MapLocation[];
  searchFilteredLocations: MapLocation[];
  filteredRoutesForList: MapRoute[];
};

export const buildEarlyHydratorPageListsPatch = (
  initialData: MapPageData,
  filters: MapFilters
): MapPageListsPatch => ({
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
});
