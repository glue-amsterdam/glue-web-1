"use client";

import { useEffect, type RefObject } from "react";
import { NAV_CSS_VARS } from "@/components/navbar/navbar-heights";

export const useNavSecondaryHeight = (
  ref: RefObject<HTMLElement | null>,
  enabled: boolean
) => {
  useEffect(() => {
    const root = document.documentElement;

    if (!enabled) {
      root.style.setProperty(NAV_CSS_VARS.secondary, "0px");
      return;
    }

    const element = ref.current;
    if (!element) return;

    const setHeight = (height: number) => {
      root.style.setProperty(NAV_CSS_VARS.secondary, `${height}px`);
    };

    setHeight(element.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setHeight(entry.contentRect.height);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      root.style.setProperty(NAV_CSS_VARS.secondary, "0px");
    };
  }, [enabled, ref]);
};
