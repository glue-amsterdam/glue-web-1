"use client";

import { useEffect, type RefObject } from "react";

const CSS_VAR = "--filter-panel-open-h";

/**
 * Publishes the height of a filter dropdown panel to a CSS custom property on
 * the document root (`--filter-panel-open-h`).
 *
 * The secondary filter navbar is `position: fixed` and its dropdown panel is an
 * absolute overlay. Pages read this variable to push their grid down by exactly
 * the panel height (mobile only), so an active filter's panel never permanently
 * hides participants.
 *
 * `shouldPush` should be true only once a filter is actually applied (active),
 * NOT merely while the panel is open for browsing. This avoids the grid jumping
 * down (and back) just from opening the menu without selecting anything.
 *
 * When `shouldPush` is false (or the panel is unmounted) the variable is reset
 * to `0px`.
 */
export const useFilterPanelHeight = (
  ref: RefObject<HTMLElement | null>,
  shouldPush: boolean
) => {
  useEffect(() => {
    const root = document.documentElement;

    const reset = () => {
      root.style.setProperty(CSS_VAR, "0px");
    };

    if (!shouldPush || !ref.current) {
      reset();
      return reset;
    }

    const element = ref.current;

    const update = () => {
      root.style.setProperty(CSS_VAR, `${element.offsetHeight}px`);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
      reset();
    };
  }, [ref, shouldPush]);
};
