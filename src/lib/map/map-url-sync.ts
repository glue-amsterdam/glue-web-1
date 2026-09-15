export const normalizeMapUrlForCompare = (url: string): string => {
  const [pathAndQuery = ""] = url.split("#");
  const questionIndex = pathAndQuery.indexOf("?");
  if (questionIndex === -1) {
    return pathAndQuery;
  }

  const pathname = pathAndQuery.slice(0, questionIndex);
  const search = pathAndQuery.slice(questionIndex + 1);
  const params = new URLSearchParams(search);
  const sorted = [...params.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  );
  const normalized = new URLSearchParams(sorted).toString();
  return normalized ? `${pathname}?${normalized}` : pathname;
};

export const shouldAckUrlWrite = ({
  writtenUrl,
  currentSearch,
  pathname,
}: {
  writtenUrl: string | null;
  currentSearch: string;
  pathname: string;
}): boolean => {
  if (!writtenUrl) return false;
  const currentUrl = currentSearch
    ? `${pathname}?${currentSearch}`
    : pathname;
  return (
    normalizeMapUrlForCompare(writtenUrl) ===
    normalizeMapUrlForCompare(currentUrl)
  );
};

export type UrlHydrationDecision = {
  applyPlace: boolean;
  applyRoute: boolean;
  clear: boolean;
  skip: boolean;
};

export const shouldApplyUrlHydration = ({
  isWriting,
  pendingPlaceId,
  pendingRouteId,
  urlPlace,
  urlRoute,
  hasAnySearchParams,
}: {
  isWriting: boolean;
  pendingPlaceId: string | null;
  pendingRouteId: string | null;
  urlPlace: string | null;
  urlRoute: string | null;
  hasAnySearchParams: boolean;
}): UrlHydrationDecision => {
  if (isWriting) {
    return { applyPlace: false, applyRoute: false, clear: false, skip: true };
  }

  if (!hasAnySearchParams) {
    if (pendingPlaceId || pendingRouteId) {
      return { applyPlace: false, applyRoute: false, clear: false, skip: true };
    }
    return { applyPlace: false, applyRoute: false, clear: true, skip: false };
  }

  if (urlPlace) {
    if (pendingRouteId) {
      return { applyPlace: false, applyRoute: false, clear: false, skip: true };
    }
    if (pendingPlaceId && pendingPlaceId !== urlPlace) {
      return { applyPlace: false, applyRoute: false, clear: false, skip: true };
    }
    return { applyPlace: true, applyRoute: false, clear: false, skip: false };
  }

  if (urlRoute) {
    if (pendingPlaceId) {
      return { applyPlace: false, applyRoute: false, clear: false, skip: true };
    }
    if (pendingRouteId && pendingRouteId !== urlRoute) {
      return { applyPlace: false, applyRoute: false, clear: false, skip: true };
    }
    return { applyPlace: false, applyRoute: true, clear: false, skip: false };
  }

  if (pendingPlaceId || pendingRouteId) {
    return { applyPlace: false, applyRoute: false, clear: false, skip: true };
  }

  return { applyPlace: false, applyRoute: false, clear: true, skip: false };
};
