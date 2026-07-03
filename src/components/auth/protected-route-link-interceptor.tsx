"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  buildSignUpHref,
  captureCurrentCancelPath,
  persistAuthCancelPath,
} from "@/lib/auth/post-auth-redirect";
import { requiresUserAuth } from "@/lib/auth/protected-routes";

export const ProtectedRouteLinkInterceptor = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isLoading || user) {
        return;
      }

      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target === "_blank") {
        return;
      }

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      const search = url.search.startsWith("?")
        ? url.search.slice(1)
        : url.search;

      if (!requiresUserAuth(url.pathname, new URLSearchParams(search))) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const cancelTo = captureCurrentCancelPath();
      persistAuthCancelPath(cancelTo);
      const signUpHref = buildSignUpHref(url.pathname, search, cancelTo);
      router.push(signUpHref);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isLoading, router, user]);

  return null;
};
