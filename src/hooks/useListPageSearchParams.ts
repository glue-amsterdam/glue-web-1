"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getClientSearchParamsString,
  LIST_PAGE_URL_CHANGE_EVENT,
} from "@/lib/list-page-session-cache";

/**
 * Search params that stay in sync with `replaceListPageUrl` (history.replaceState)
 * and with Next.js client navigations (useSearchParams).
 */
export const useListPageSearchParams = (): URLSearchParams => {
  const routerSearchParams = useSearchParams();
  const [clientQuery, setClientQuery] = useState(() =>
    routerSearchParams.toString()
  );

  useEffect(() => {
    const syncFromLocation = () => {
      setClientQuery(getClientSearchParamsString());
    };

    syncFromLocation();
    window.addEventListener(LIST_PAGE_URL_CHANGE_EVENT, syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);

    return () => {
      window.removeEventListener(LIST_PAGE_URL_CHANGE_EVENT, syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  useEffect(() => {
    setClientQuery(getClientSearchParamsString());
  }, [routerSearchParams]);

  return useMemo(() => {
    if (typeof window === "undefined") {
      return routerSearchParams;
    }

    return new URLSearchParams(clientQuery);
  }, [clientQuery, routerSearchParams]);
};
