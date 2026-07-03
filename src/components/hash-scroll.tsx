"use client";

import { useEffect } from "react";
import {
  consumeSkipHashScrollSync,
  restoreAboutArchiveReturnIfNeeded,
} from "@/lib/navigation/hash-route";

// How long to keep looking for a target that hasn't rendered yet (streamed /
// on-demand compiled routes can take a while, especially in development).
const FIND_TIMEOUT_MS = 6000;
// Once the target exists, keep re-aligning for this long so async images /
// late layout shifts don't leave the title hidden under the fixed header.
const SETTLE_TIMEOUT_MS = 2500;

const HashScroll = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelActiveSession: (() => void) | null = null;
    let handledHash = "";
    let isPopstateNavigation = false;

    const runSession = (targetId: string) => {
      let userInterrupted = false;
      const handleUserScroll = () => {
        userInterrupted = true;
      };

      window.addEventListener("wheel", handleUserScroll, { passive: true });
      window.addEventListener("touchmove", handleUserScroll, { passive: true });
      window.addEventListener("keydown", handleUserScroll);

      let frameId = 0;
      let settleTimer = 0;
      let resizeObserver: ResizeObserver | null = null;

      const stop = () => {
        cancelAnimationFrame(frameId);
        clearTimeout(settleTimer);
        resizeObserver?.disconnect();
        window.removeEventListener("wheel", handleUserScroll);
        window.removeEventListener("touchmove", handleUserScroll);
        window.removeEventListener("keydown", handleUserScroll);
      };

      const alignTarget = () => {
        if (userInterrupted) {
          return null;
        }
        const target = document.getElementById(targetId);
        if (target) {
          // Honors the scroll-margin-top set on the section, so it stops
          // just below the fixed header instead of underneath it.
          target.scrollIntoView({ block: "start", behavior: "auto" });
        }
        return target;
      };

      const startedAt = performance.now();

      const findLoop = () => {
        if (userInterrupted) {
          stop();
          return;
        }

        const target = alignTarget();
        if (target) {
          // Re-align whenever the document height changes (late images,
          // entrance animations) until things settle or the user takes over.
          resizeObserver = new ResizeObserver(() => {
            alignTarget();
          });
          resizeObserver.observe(document.body);
          settleTimer = window.setTimeout(stop, SETTLE_TIMEOUT_MS);
          return;
        }

        if (performance.now() - startedAt < FIND_TIMEOUT_MS) {
          frameId = requestAnimationFrame(findLoop);
          return;
        }

        stop();
      };

      frameId = requestAnimationFrame(findLoop);

      return stop;
    };

    const syncToHash = () => {
      const { hash } = window.location;

      if (hash.length < 2) {
        if (handledHash) {
          cancelActiveSession?.();
          cancelActiveSession = null;
        }
        handledHash = "";
        return;
      }

      // Ignore repeat notifications for a hash we already handled. Next.js
      // calls history.replaceState on scroll to persist position, which would
      // otherwise restart the session and fight the user's scrolling.
      if (hash === handledHash) {
        return;
      }

      handledHash = hash;
      cancelActiveSession?.();
      cancelActiveSession = runSession(decodeURIComponent(hash.slice(1)));
    };

    // Next.js <Link> navigates via history.pushState, which fires no
    // hashchange event, so patch the history methods to learn about every
    // client navigation (same-page and cross-page alike). Defer to the next
    // frame so the URL and the new DOM are committed before we read them.
    const scheduleSync = () => {
      requestAnimationFrame(() => {
        if (consumeSkipHashScrollSync()) {
          isPopstateNavigation = false;
          return;
        }

        restoreAboutArchiveReturnIfNeeded(isPopstateNavigation);
        isPopstateNavigation = false;
        syncToHash();
      });
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(
      window.history
    );

    window.history.pushState = (...args) => {
      originalPushState(...args);
      scheduleSync();
    };
    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      scheduleSync();
    };

    window.addEventListener("hashchange", syncToHash);
    window.addEventListener("popstate", () => {
      isPopstateNavigation = true;
      scheduleSync();
    });

    scheduleSync();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("hashchange", syncToHash);
      window.removeEventListener("popstate", scheduleSync);
      cancelActiveSession?.();
    };
  }, []);

  return null;
};

export default HashScroll;
