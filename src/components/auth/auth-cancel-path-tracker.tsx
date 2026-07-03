"use client";

import { useEffect } from "react";
import {
  captureCurrentCancelPath,
  persistAuthCancelPath,
} from "@/lib/auth/post-auth-redirect";

export const AuthCancelPathTracker = () => {
  useEffect(() => {
    const persist = () => {
      persistAuthCancelPath(captureCurrentCancelPath());
    };

    const schedulePersist = () => {
      requestAnimationFrame(persist);
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args) => {
      originalPushState(...args);
      schedulePersist();
    };

    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      schedulePersist();
    };

    window.addEventListener("hashchange", persist);
    window.addEventListener("popstate", schedulePersist);
    persist();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("hashchange", persist);
      window.removeEventListener("popstate", schedulePersist);
    };
  }, []);

  return null;
};
