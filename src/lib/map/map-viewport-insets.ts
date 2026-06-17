"use client";

import { useLayoutEffect, useState } from "react";

export const SITE_FOOTER_SELECTOR = "#bottom-banner";
export const ROUTE_FOOTER_SELECTOR = "[data-route-footer]";
export const EXHIBITOR_FOOTER_SELECTOR = "[data-exhibitor-footer]";

const MAP_BOTTOM_UI_SELECTORS = [
  ROUTE_FOOTER_SELECTOR,
  EXHIBITOR_FOOTER_SELECTOR,
] as const;

/** Matches bottom bar h-[65px] + borders in bottom-navigation.tsx */
export const DEFAULT_SITE_FOOTER_HEIGHT_PX = 65;

/** Distance from the viewport bottom to the top edge of the highest bottom UI (footer / route bar). */
export const measureMapBottomInset = (): number => {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_FOOTER_HEIGHT_PX;
  }

  const footerTops: number[] = [];

  const siteFooter = document.querySelector(SITE_FOOTER_SELECTOR);
  if (siteFooter) {
    footerTops.push(siteFooter.getBoundingClientRect().top);
  }

  for (const selector of MAP_BOTTOM_UI_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      footerTops.push(element.getBoundingClientRect().top);
    }
  }

  if (footerTops.length === 0) {
    return DEFAULT_SITE_FOOTER_HEIGHT_PX;
  }

  const highestFooterTop = Math.min(...footerTops);
  const inset = window.innerHeight - highestFooterTop;

  return inset > 0 ? inset : DEFAULT_SITE_FOOTER_HEIGHT_PX;
};

export const useMapBottomInset = (enabled: boolean): number => {
  const [bottomInset, setBottomInset] = useState(DEFAULT_SITE_FOOTER_HEIGHT_PX);

  useLayoutEffect(() => {
    if (!enabled) return;

    const update = () => setBottomInset(measureMapBottomInset());

    update();

    const observed = new Set<Element>();
    const resizeObserver = new ResizeObserver(update);

    const observeElement = (element: Element | null) => {
      if (!element || observed.has(element)) return;
      observed.add(element);
      resizeObserver.observe(element);
    };

    const observeMapBottomUi = () => {
      for (const selector of MAP_BOTTOM_UI_SELECTORS) {
        observeElement(document.querySelector(selector));
      }
    };

    observeElement(document.querySelector(SITE_FOOTER_SELECTOR));
    observeMapBottomUi();

    const mutationObserver = new MutationObserver(() => {
      observeMapBottomUi();
      update();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return bottomInset;
};
