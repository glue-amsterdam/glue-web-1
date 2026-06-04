"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import { useDebouncedUrlSearch } from "@/hooks/useDebouncedUrlSearch";
import { useMapFiltersFromUrl } from "@/hooks/useMapFiltersFromUrl";
import { useFilterPanel } from "@/hooks/useFilterPanel";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { withExhibitorsView } from "@/lib/map/map-filter-actions";
import BaseSecondNavbar, { FilterButton } from "./base-second-navbar";
import { MapFilterScrollPanel } from "./map-filter-scroll-panel";
import {
  getMapFilterAriaLabel,
  MAP_CATEGORY_PANEL_CLASS,
  MAP_FILTER_PANEL_CLASS,
  MapFilterPanelContent,
} from "./map-filter-panel-content";
import MapSearchResults from "@/app/map/components/map-search-results";
import { filterMapRoutes } from "@/lib/map/map-filters";
import type { MapRoute } from "@/lib/map/types";
import {
  type MapFilterId,
  useMapNavigation,
  useMapPage,
  useMapStore,
} from "@/app/map/stores/use-map-store";

const SEARCH_DEBOUNCE_MS = 400;

type MapNavbarProps = {
  initialRoutes: MapRoute[];
};

const MapNavbar = ({ initialRoutes }: MapNavbarProps) => {
  const mapPageStore = useMapPage();
  const navigation = useMapNavigation();
  const setFilterPanel = useMapStore((state) => state.setFilterPanel);
  const clearFilterPanel = useMapStore((state) => state.clearFilterPanel);
  const resetMapStore = useMapStore((state) => state.reset);
  const { filters, urlFilters, applyFilters, previewFilters } =
    useMapFiltersFromUrl();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const panelDismissedByUserRef = useRef(false);

  const {
    openFilter,
    closeFilter,
    setOpenFilter,
  } = useFilterPanel<MapFilterId>();

  const handleSearchCommit = useCallback(
    (q: string) => {
      if (isLargeScreen) {
        if (q.trim()) {
          applyFilters(withExhibitorsView(filters, { q }));
          setOpenFilter("exhibitors");
          return;
        }
        applyFilters({ q });
        return;
      }
      applyFilters({ q });
    },
    [applyFilters, filters, isLargeScreen, setOpenFilter]
  );

  const {
    inputValue: searchValue,
    onInputChange: handleDebouncedSearchChange,
    onInputKeyDown: handleSearchKeyDown,
  } = useDebouncedUrlSearch({
    urlValue: urlFilters.q,
    onCommit: handleSearchCommit,
    debounceMs: SEARCH_DEBOUNCE_MS,
  });

  const routesPanelId = useId();
  const exhibitorsPanelId = useId();
  const categoryPanelId = useId();
  const panelAnchorRef = useRef<HTMLDivElement>(null);
  const mapNavbarRef = useRef<HTMLElement>(null);

  const routes = mapPageStore?.routes ?? initialRoutes;
  const hasRoutes = routes.length > 0;
  const filteredRoutesForList =
    mapPageStore?.filteredRoutesForList ??
    filterMapRoutes(initialRoutes, filters.q);
  const searchQuery = filters.q.trim();
  const showSearchResults =
    !isLargeScreen &&
    searchQuery.length > 0 &&
    ((mapPageStore?.searchFilteredLocations?.length ?? 0) > 0 ||
      filteredRoutesForList.length > 0);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleDebouncedSearchChange(event);
      if (!isLargeScreen) return;

      const q = event.target.value;
      previewFilters(withExhibitorsView(filters, { q }));
      if (q.trim()) {
        setOpenFilter("exhibitors");
      }
    },
    [handleDebouncedSearchChange, isLargeScreen, previewFilters, filters, setOpenFilter]
  );

  const clearMapSelectionForBrowse = useCallback(() => {
    if (isLargeScreen) return;
    navigation?.clearSelectionLocal();
    navigation?.navigateMap({ selection: { clearSelection: true } });
  }, [navigation, isLargeScreen]);

  const handleExhibitorsToggle = (_filter: MapFilterId) => {
    if (openFilter === "exhibitors") {
      applyFilters({ view: "none" });
      closeFilter();
      return;
    }
    panelDismissedByUserRef.current = false;
    clearMapSelectionForBrowse();
    applyFilters({ view: "exhibitors" });
    setOpenFilter("exhibitors");
  };

  const handleExhibitorsKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    filter: MapFilterId
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleExhibitorsToggle(filter);
  };

  const handleExhibitorListSelect = useCallback(
    (locationId: string) => {
      if (!navigation) return;

      if (!isLargeScreen) closeFilter();
      navigation.selectLocationLocal(locationId);
      navigation.navigateMap({
        filterPatch: isLargeScreen ? { view: "exhibitors" } : { view: "none" },
        selection: { place: locationId },
      });
    },
    [navigation, closeFilter, isLargeScreen]
  );

  const handleSearchExhibitorSelect = useCallback(
    (locationId: string) => {
      if (!navigation) return;

      if (!isLargeScreen) closeFilter();
      navigation.selectLocationLocal(locationId);
      navigation.navigateMap({
        filterPatch: isLargeScreen
          ? { q: "", type: "all" }
          : { view: "none", q: "" },
        selection: { place: locationId },
        clearSearch: !isLargeScreen,
      });
    },
    [navigation, closeFilter, isLargeScreen]
  );

  const handleSearchRouteSelect = useCallback(
    (routeId: string) => {
      if (!navigation) return;

      if (!isLargeScreen) closeFilter();
      navigation.selectRouteLocal(routeId);
      navigation.navigateMap({
        filterPatch: isLargeScreen ? { q: "" } : undefined,
        selection: { route: routeId },
      });
    },
    [navigation, closeFilter, isLargeScreen]
  );

  const handleRouteListSelect = useCallback(
    (routeId: string) => {
      if (!navigation) return;

      if (!isLargeScreen) closeFilter();
      navigation.selectRouteLocal(routeId);
      navigation.navigateMap({
        filterPatch: isLargeScreen ? { q: "" } : undefined,
        selection: { route: routeId },
      });
    },
    [navigation, closeFilter, isLargeScreen]
  );

  const handleRoutesToggle = (_filter: MapFilterId) => {
    if (openFilter === "routes") {
      closeFilter();
      return;
    }
    clearMapSelectionForBrowse();
    setOpenFilter("routes");
  };

  const handleRoutesKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    filter: MapFilterId
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleRoutesToggle(filter);
  };

  const handleCategoryToggle = (_filter: MapFilterId) => {
    if (openFilter === "category") {
      closeFilter();
      return;
    }
    clearMapSelectionForBrowse();
    setOpenFilter("category");
  };

  const handleCategoryKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    filter: MapFilterId
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleCategoryToggle(filter);
  };

  const handleTypeSelect = useCallback(
    (value: ExhibitorsFilterType) => {
      panelDismissedByUserRef.current = false;
      if (!isLargeScreen) {
        navigation?.clearSelectionLocal();
      }
      applyFilters(withExhibitorsView(filters, { type: value }));
      setOpenFilter("exhibitors");
    },
    [applyFilters, filters, setOpenFilter, navigation, isLargeScreen]
  );

  const handleRouteSelected = useCallback(() => {
    if (!isLargeScreen) {
      closeFilter();
    }
  }, [closeFilter, isLargeScreen]);

  const handleDismissOpenFilter = useCallback(() => {
    panelDismissedByUserRef.current = true;
    closeFilter();
  }, [closeFilter]);

  const openPanelId =
    openFilter === "category"
      ? categoryPanelId
      : openFilter === "exhibitors"
        ? exhibitorsPanelId
        : openFilter === "routes"
          ? routesPanelId
          : null;

  useLayoutEffect(() => {
    setFilterPanel({
      openFilter,
      openPanelId,
      onExhibitorListSelect: handleExhibitorListSelect,
      onRouteListSelect: handleRouteListSelect,
      onTypeSelect: handleTypeSelect,
      onRouteSelected: handleRouteSelected,
    });

    return () => clearFilterPanel();
  }, [
    openFilter,
    openPanelId,
    handleExhibitorListSelect,
    handleRouteListSelect,
    handleTypeSelect,
    handleRouteSelected,
    setFilterPanel,
    clearFilterPanel,
  ]);

  useEffect(() => {
    return () => resetMapStore();
  }, [resetMapStore]);

  useEffect(() => {
    if (filters.view !== "exhibitors") {
      panelDismissedByUserRef.current = false;
      return;
    }
    if (panelDismissedByUserRef.current) return;

    setOpenFilter((current) =>
      current === "category" || current === "routes" ? current : "exhibitors"
    );
  }, [filters.view, setOpenFilter]);

  useEffect(() => {
    if (isLargeScreen || !openFilter || !openPanelId) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (mapNavbarRef.current?.contains(target)) return;

      const panel = document.getElementById(openPanelId);
      if (panel?.contains(target)) return;

      const mapSurface = document.querySelector("[data-map-surface]");
      if (mapSurface?.contains(target)) return;

      handleDismissOpenFilter();
    };

    const timeoutId = window.setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    isLargeScreen,
    openFilter,
    openPanelId,
    handleDismissOpenFilter,
  ]);

  return (
    <section
      ref={mapNavbarRef}
      aria-label="Map filters"
      className="w-full h-(--nav-secondary-h) flex items-center relative overflow-visible border-b lg:border-b-2 border-(--black-color) bg-(--white-color) py-[12px]"
    >
      <BaseSecondNavbar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputId="map-search-filter"
        searchAriaLabel="Search exhibitors and routes"
        searchAfter={
          showSearchResults ? (
            <MapSearchResults
              locations={mapPageStore?.searchFilteredLocations ?? []}
              routes={filteredRoutesForList}
              onExhibitorSelect={handleSearchExhibitorSelect}
              onRouteSelect={handleSearchRouteSelect}
            />
          ) : null
        }
      >
        <FilterButton<MapFilterId>
          filterId="exhibitors"
          openFilter={openFilter}
          panelId={exhibitorsPanelId}
          label="Exhibitors"
          onToggle={handleExhibitorsToggle}
          onKeyDown={handleExhibitorsKeyDown}
        />

        {hasRoutes && (
          <FilterButton<MapFilterId>
            filterId="routes"
            openFilter={openFilter}
            panelId={routesPanelId}
            label="Routes"
            onToggle={handleRoutesToggle}
            onKeyDown={handleRoutesKeyDown}
          />
        )}

        <FilterButton<MapFilterId>
          filterId="category"
          openFilter={openFilter}
          panelId={categoryPanelId}
          label="Category"
          onToggle={handleCategoryToggle}
          onKeyDown={handleCategoryKeyDown}
        />
      </BaseSecondNavbar>

      <div
        ref={panelAnchorRef}
        className="absolute left-0 right-0 top-full h-0 w-full pointer-events-none"
        aria-hidden
      />

      {!isLargeScreen && mapPageStore && (
        <MapFilterScrollPanel
          isOpen={openFilter === "exhibitors"}
          panelId={exhibitorsPanelId}
          ariaLabel={getMapFilterAriaLabel("exhibitors")}
          placement="bottom-sheet"
          anchorRef={panelAnchorRef}
          className={MAP_FILTER_PANEL_CLASS}
        >
          <MapFilterPanelContent filterId="exhibitors" variant="panel" />
        </MapFilterScrollPanel>
      )}

      {!isLargeScreen && hasRoutes && (
        <MapFilterScrollPanel
          isOpen={openFilter === "routes"}
          panelId={routesPanelId}
          ariaLabel={getMapFilterAriaLabel("routes")}
          placement="below-map"
          className={MAP_FILTER_PANEL_CLASS}
        >
          <MapFilterPanelContent filterId="routes" variant="panel" />
        </MapFilterScrollPanel>
      )}

      {!isLargeScreen && (
        <MapFilterScrollPanel
          isOpen={openFilter === "category"}
          panelId={categoryPanelId}
          ariaLabel={getMapFilterAriaLabel("category")}
          placement="below-map"
          className={MAP_CATEGORY_PANEL_CLASS}
        >
          <MapFilterPanelContent filterId="category" variant="panel" />
        </MapFilterScrollPanel>
      )}
    </section>
  );
};

export default MapNavbar;
