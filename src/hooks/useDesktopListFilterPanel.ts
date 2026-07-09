"use client";

import { useCallback, useEffect, useMemo, useRef, type KeyboardEvent } from "react";

import { useFilterPanel } from "@/hooks/useFilterPanel";

type UseDesktopListFilterPanelOptions<TFilterId extends string> = {
  activeFilterId: TFilterId | null;
  isFilterActive: (id: TFilterId) => boolean;
  onClearFilter: (id: TFilterId) => void;
  pinWhenActive?: boolean;
  closeOnSelect?: boolean;
};

export const useDesktopListFilterPanel = <TFilterId extends string>({
  activeFilterId,
  isFilterActive,
  onClearFilter,
  pinWhenActive = true,
  closeOnSelect = false,
}: UseDesktopListFilterPanelOptions<TFilterId>) => {
  const {
    openFilter,
    setOpenFilter,
    closeFilter,
  } = useFilterPanel<TFilterId>();

  const effectiveOpenFilter = useMemo(() => {
    if (openFilter !== null) return openFilter;
    if (!pinWhenActive) return null;
    return activeFilterId;
  }, [activeFilterId, openFilter, pinWhenActive]);

  const prevActiveFilterIdRef = useRef(activeFilterId);

  useEffect(() => {
    const justActivated =
      prevActiveFilterIdRef.current === null &&
      activeFilterId !== null &&
      openFilter === activeFilterId;

    prevActiveFilterIdRef.current = activeFilterId;

    if (justActivated) {
      closeFilter();
    }
  }, [activeFilterId, closeFilter, openFilter]);

  const handleFilterToggle = useCallback(
    (filterId: TFilterId) => {
      if (openFilter === filterId) {
        if (isFilterActive(filterId)) {
          onClearFilter(filterId);
        }
        closeFilter();
        return;
      }

      if (isFilterActive(filterId)) {
        onClearFilter(filterId);
        closeFilter();
        return;
      }

      if (activeFilterId && activeFilterId !== filterId) {
        onClearFilter(activeFilterId);
      }

      setOpenFilter(filterId);
    },
    [
      activeFilterId,
      closeFilter,
      isFilterActive,
      onClearFilter,
      openFilter,
      setOpenFilter,
    ]
  );

  const handleFilterKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, filterId: TFilterId) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      handleFilterToggle(filterId);
    },
    [handleFilterToggle]
  );

  const isPanelVisible = useCallback(
    (filterId: TFilterId) => effectiveOpenFilter === filterId,
    [effectiveOpenFilter]
  );

  const isButtonOpen = useCallback(
    (filterId: TFilterId) =>
      openFilter === filterId || isFilterActive(filterId),
    [isFilterActive, openFilter]
  );

  const isPanelPinned = useCallback(
    (filterId: TFilterId) =>
      isFilterActive(filterId) && activeFilterId === filterId,
    [activeFilterId, isFilterActive]
  );

  const afterSelect = useCallback(() => {
    if (closeOnSelect) {
      closeFilter();
    }
  }, [closeFilter, closeOnSelect]);

  return {
    openFilter: effectiveOpenFilter,
    effectiveOpenFilter,
    handleFilterToggle,
    handleFilterKeyDown,
    closeFilter,
    setOpenFilter,
    isPanelVisible,
    isButtonOpen,
    isPanelPinned,
    afterSelect,
  };
};
