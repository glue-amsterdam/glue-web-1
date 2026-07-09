"use client";

import {
    useCallback,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ExhibitorSortField } from "@/lib/participants/exhibitor-types";
import {
    DEFAULT_EXHIBITORS_FILTERS,
    type ExhibitorsFilterType,
    type ExhibitorsFilters,
} from "@/lib/participants/exhibitors-filters";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import { useDebouncedUrlSearch } from "@/hooks/useDebouncedUrlSearch";
import { useDesktopListFilterPanel } from "@/hooks/useDesktopListFilterPanel";
import { useExhibitorsFiltersFromUrl } from "@/hooks/useExhibitorsFiltersFromUrl";
import { useFilterPanelHeight } from "@/hooks/useFilterPanelHeight";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { cn } from "@/lib/utils";
import RoundedNumber from "../rounded-number";
import BaseSecondNavbar, { FilterButton } from "./base-second-navbar";
import { FilterDropdownPanel } from "./filter-dropdown-panel";

type ExhibitorFilterId = "category" | "sort";

type SortOption = {
    field: ExhibitorSortField;
    label: string;
};

const SEARCH_DEBOUNCE_MS = 400;

const SORT_OPTIONS: SortOption[] = [
    { field: "name", label: "A - Z" },
    { field: "displayNumber", label: "1 - 60" },
];

const isCategoryFilterActive = (filters: ExhibitorsFilters) =>
    filters.type !== "all";

const isSortFilterActive = (filters: ExhibitorsFilters) =>
    filters.sort === "name";

const getActiveFilterId = (
    filters: ExhibitorsFilters
): ExhibitorFilterId | null => {
    if (isCategoryFilterActive(filters)) return "category";
    if (isSortFilterActive(filters)) return "sort";
    return null;
};

const ExhibitorsNavbar = () => {
    const { filterOptions } = useParticipantCategories();
    const { filters, updateFilters } = useExhibitorsFiltersFromUrl();
    const isLargeScreen = useMediaQuery("(min-width: 1024px)");
    const [isDisplayNumberSortChosen, setIsDisplayNumberSortChosen] =
        useState(false);
    const handleSearchCommit = useCallback(
        (q: string) => {
            if (q.trim()) {
                setIsDisplayNumberSortChosen(false);
                updateFilters({
                    q,
                    type: "all",
                    sort: DEFAULT_EXHIBITORS_FILTERS.sort,
                    order: DEFAULT_EXHIBITORS_FILTERS.order,
                });
                return;
            }

            updateFilters({ q: "" });
        },
        [updateFilters]
    );
    const {
        inputValue: searchValue,
        onInputChange: handleSearchChange,
        onInputKeyDown: handleSearchKeyDown,
    } = useDebouncedUrlSearch({
        urlValue: filters.q,
        onCommit: handleSearchCommit,
        debounceMs: SEARCH_DEBOUNCE_MS,
    });

    const activeFilterId = useMemo(() => getActiveFilterId(filters), [filters]);

    const isFilterActive = useCallback(
        (filterId: ExhibitorFilterId) => {
            if (filterId === "category") return isCategoryFilterActive(filters);
            return isSortFilterActive(filters);
        },
        [filters]
    );

    const handleClearFilter = useCallback(
        (filterId: ExhibitorFilterId) => {
            if (filterId === "category") {
                updateFilters({ type: "all", q: "" });
                return;
            }

            setIsDisplayNumberSortChosen(false);
            updateFilters({
                sort: DEFAULT_EXHIBITORS_FILTERS.sort,
                order: DEFAULT_EXHIBITORS_FILTERS.order,
                q: "",
            });
        },
        [updateFilters]
    );

    const {
        openFilter,
        handleFilterToggle,
        handleFilterKeyDown,
        isButtonOpen,
        afterSelect,
        setOpenFilter,
    } = useDesktopListFilterPanel<ExhibitorFilterId>({
        activeFilterId,
        isFilterActive,
        onClearFilter: handleClearFilter,
        pinWhenActive: isLargeScreen,
        closeOnSelect: !isLargeScreen,
    });

    const categoryPanelId = useId();
    const sortPanelId = useId();

    const categoryPanelRef = useRef<HTMLDivElement>(null);
    const sortPanelRef = useRef<HTMLDivElement>(null);

    useFilterPanelHeight(
        categoryPanelRef,
        isLargeScreen &&
            openFilter === "category" &&
            activeFilterId === "category"
    );
    useFilterPanelHeight(
        sortPanelRef,
        isLargeScreen && openFilter === "sort" && activeFilterId === "sort"
    );

    const handleTypeSelect = (value: ExhibitorsFilterType) => {
        setIsDisplayNumberSortChosen(false);

        if (value === "all") {
            updateFilters({ type: "all", q: "" });
            afterSelect();
            return;
        }

        updateFilters({
            type: value,
            sort: DEFAULT_EXHIBITORS_FILTERS.sort,
            order: DEFAULT_EXHIBITORS_FILTERS.order,
            q: "",
        });
        afterSelect();
    };

    const handleSortSelect = (field: ExhibitorSortField) => {
        if (field === "displayNumber") {
            if (
                filters.sort === DEFAULT_EXHIBITORS_FILTERS.sort &&
                filters.order === DEFAULT_EXHIBITORS_FILTERS.order &&
                isDisplayNumberSortChosen
            ) {
                return;
            }

            setIsDisplayNumberSortChosen(true);
            updateFilters({
                sort: DEFAULT_EXHIBITORS_FILTERS.sort,
                order: DEFAULT_EXHIBITORS_FILTERS.order,
                q: "",
            });

            if (isLargeScreen) {
                setOpenFilter("sort");
            } else {
                afterSelect();
            }
            return;
        }

        setIsDisplayNumberSortChosen(false);

        if (filters.sort === field && filters.order === "asc") {
            return;
        }

        updateFilters({
            sort: field,
            order: "asc",
            type: "all",
            q: "",
        });
        afterSelect();
    };

    const handleSortClearAll = () => {
        setIsDisplayNumberSortChosen(false);
        updateFilters({
            sort: DEFAULT_EXHIBITORS_FILTERS.sort,
            order: DEFAULT_EXHIBITORS_FILTERS.order,
            q: "",
        });
        afterSelect();
    };

    return (
        <section
            aria-label="Exhibitors filters"
            className="w-full h-(--nav-secondary-h) flex items-stretch lg:items-center py-0 lg:py-[12px] relative overflow-visible border-b lg:border-b-2 border-(--black-color) bg-(--background-color)"
        >
            <BaseSecondNavbar
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                onSearchKeyDown={handleSearchKeyDown}
                searchInputId="exhibitors-search-filter"
                searchAriaLabel="Search exhibitors by name"
            >
                <FilterButton<ExhibitorFilterId>
                    filterId="category"
                    openFilter={openFilter}
                    panelId={categoryPanelId}
                    label="Category"
                    isActive={activeFilterId === "category" && openFilter === "category"}
                    isOpen={isButtonOpen("category")}
                    onToggle={handleFilterToggle}
                    onKeyDown={handleFilterKeyDown}
                />
                <FilterButton<ExhibitorFilterId>
                    filterId="sort"
                    openFilter={openFilter}
                    panelId={sortPanelId}
                    label="Sort"
                    isActive={activeFilterId === "sort" && openFilter === "sort"}
                    isOpen={isButtonOpen("sort")}
                    onToggle={handleFilterToggle}
                    onKeyDown={handleFilterKeyDown}
                />
            </BaseSecondNavbar>

            <FilterDropdownPanel<ExhibitorFilterId>
                ref={categoryPanelRef}
                filterId="category"
                openFilter={openFilter}
                panelId={categoryPanelId}
                ariaLabel="Category options"
                className="py-[30px] lg:py-[25px] second-navbar-gap min-h-[80px] lg:h-[81px]"
            >
                <button
                    type="button"
                    aria-pressed={activeFilterId !== "category"}
                    onClick={() => handleTypeSelect("all")}
                    className={cn(
                        "lg:hidden text-left base-text-size cursor-pointer",
                        activeFilterId !== "category" && "text-(--primary-color)"
                    )}
                >
                    All
                </button>
                {filterOptions.map((option) => {
                    const isSelected =
                        activeFilterId === "category" &&
                        filters.type === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleTypeSelect(option.value)}
                            className={cn(
                                "text-left flex items-center gap-[15px] base-text-size cursor-pointer",
                                isSelected && "text-(--primary-color)"
                            )}
                        >
                            <RoundedNumber
                                type={option.value}
                                participant_n={"00"}
                            />
                            {option.label}
                        </button>
                    );
                })}
            </FilterDropdownPanel>

            <FilterDropdownPanel<ExhibitorFilterId>
                ref={sortPanelRef}
                filterId="sort"
                openFilter={openFilter}
                panelId={sortPanelId}
                ariaLabel="Sort options"
                className="py-[35px] lg:py-[25px] second-navbar-gap min-h-[80px] lg:h-[81px]"
            >
                <button
                    type="button"
                    aria-pressed={activeFilterId !== "sort"}
                    onClick={handleSortClearAll}
                    className={cn(
                        "lg:hidden text-left base-text-size cursor-pointer",
                        activeFilterId !== "sort" && "text-(--primary-color)"
                    )}
                >
                    All
                </button>
                {SORT_OPTIONS.map((option) => {
                    const isSelected =
                        option.field === "name"
                            ? activeFilterId === "sort" &&
                            filters.sort === option.field
                            : isDisplayNumberSortChosen &&
                            filters.sort === option.field;

                    return (
                        <button
                            key={option.field}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleSortSelect(option.field)}
                            className={cn(
                                "text-left flex items-center gap-[20px] base-text-size cursor-pointer",
                                isSelected && "text-(--primary-color)"
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </FilterDropdownPanel>
        </section>
    );
};

export default ExhibitorsNavbar;
