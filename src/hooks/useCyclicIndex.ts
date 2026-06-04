"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DELAY_MS = 6000;

type UseCyclicIndexOptions = {
  itemCount: number;
  delayMs?: number;
  enabled?: boolean;
  pauseOnHover?: boolean;
};

export const useCyclicIndex = ({
  itemCount,
  delayMs = DEFAULT_DELAY_MS,
  enabled = itemCount > 1,
  pauseOnHover = true,
}: UseCyclicIndexOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  const hasMultiple = itemCount > 1;

  const clearAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplay();

    if (!enabled || !hasMultiple || isPausedRef.current) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, delayMs);
  }, [clearAutoplay, delayMs, enabled, hasMultiple, itemCount]);

  useEffect(() => {
    if (currentIndex >= itemCount && itemCount > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, itemCount]);

  useEffect(() => {
    startAutoplay();

    return () => {
      clearAutoplay();
    };
  }, [clearAutoplay, startAutoplay]);

  const handleMouseEnter = useCallback(() => {
    if (!pauseOnHover) return;
    isPausedRef.current = true;
    clearAutoplay();
  }, [clearAutoplay, pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (!pauseOnHover) return;
    isPausedRef.current = false;
    startAutoplay();
  }, [pauseOnHover, startAutoplay]);

  const handleSelect = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      startAutoplay();
    },
    [startAutoplay]
  );

  return {
    currentIndex,
    setCurrentIndex,
    hasMultiple,
    handleMouseEnter,
    handleMouseLeave,
    handleSelect,
  };
};
