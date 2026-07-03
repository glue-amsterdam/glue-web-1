export const ABOUT_ARCHIVE_HREF = "/about#archive";
export const PLANS_SELECTION_HREF = "/participate#plans-selection-section";

const ABOUT_RETURN_STORAGE_KEY = "glue-about-return";
const FIND_TIMEOUT_MS = 6000;
const SETTLE_TIMEOUT_MS = 2500;

type HashHrefParts = {
  pathWithSearch: string;
  hrefWithHash: string;
  hash: string;
};

type AppRouter = {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

export const splitHashHref = (
  href: string,
  origin = "http://localhost"
): HashHrefParts => {
  const url = new URL(href, origin);

  return {
    pathWithSearch: url.pathname + url.search,
    hrefWithHash: url.pathname + url.search + url.hash,
    hash: url.hash,
  };
};

let skipNextHashScrollSync = false;

export const replaceHistorySilently = (url: string): void => {
  skipNextHashScrollSync = true;
  window.history.replaceState(window.history.state, "", url);
};

export const consumeSkipHashScrollSync = (): boolean => {
  if (!skipNextHashScrollSync) {
    return false;
  }

  skipNextHashScrollSync = false;
  return true;
};

const clearAboutArchiveReturnMarker = (): void => {
  try {
    sessionStorage.removeItem(ABOUT_RETURN_STORAGE_KEY);
  } catch {
    // private browsing / quota — ignore
  }
};

/** Remember archive as the return target without touching the URL (avoids scroll flash). */
export const markAboutArchiveReturn = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/about") {
    return;
  }

  try {
    sessionStorage.setItem(ABOUT_RETURN_STORAGE_KEY, "archive");
  } catch {
    // private browsing / quota — ignore
  }
};

/**
 * On browser-back to /about, silently add #archive so HashScroll can align the
 * section without the outbound click ever changing the URL.
 */
export const restoreAboutArchiveReturnIfNeeded = (
  isPopstateNavigation: boolean,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  let pending: string | null = null;

  try {
    pending = sessionStorage.getItem(ABOUT_RETURN_STORAGE_KEY);
  } catch {
    return;
  }

  if (pending !== "archive") {
    return;
  }

  const { hash } = window.location;

  if (hash === "#archive") {
    clearAboutArchiveReturnMarker();
    return;
  }

  if (window.location.pathname !== "/about") {
    return;
  }

  if (!isPopstateNavigation) {
    clearAboutArchiveReturnMarker();
    return;
  }

  clearAboutArchiveReturnMarker();

  const target = splitHashHref(ABOUT_ARCHIVE_HREF, window.location.origin);
  replaceHistorySilently(target.hrefWithHash);
};

const scrollToHashTarget = (hash: string): (() => void) => {
  if (!hash.startsWith("#") || hash.length < 2) {
    return () => {};
  }

  const targetId = decodeURIComponent(hash.slice(1));
  let frameId = 0;
  let settleTimer = 0;
  let resizeObserver: ResizeObserver | null = null;
  const startedAt = performance.now();

  const stop = () => {
    cancelAnimationFrame(frameId);
    clearTimeout(settleTimer);
    resizeObserver?.disconnect();
  };

  const alignTarget = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    }
    return target;
  };

  const findLoop = () => {
    const target = alignTarget();
    if (target) {
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

const applyHashWhenReady = (
  pathWithSearch: string,
  hrefWithHash: string,
  hash: string,
  attempt = 0,
): void => {
  if (window.location.pathname + window.location.search === pathWithSearch) {
    window.history.replaceState(window.history.state, "", hrefWithHash);
    scrollToHashTarget(hash);
    return;
  }

  if (attempt >= 120) {
    return;
  }

  requestAnimationFrame(() =>
    applyHashWhenReady(pathWithSearch, hrefWithHash, hash, attempt + 1),
  );
};

export const navigateWithHashHref = (
  router: AppRouter,
  href: string,
  mode: "push" | "replace",
): void => {
  const { pathWithSearch, hash, hrefWithHash } = splitHashHref(
    href,
    window.location.origin,
  );

  if (!hash) {
    if (mode === "replace") {
      router.replace(href);
    } else {
      router.push(href);
    }
    return;
  }

  const navigationOptions = { scroll: false as const };

  if (mode === "replace") {
    router.replace(hrefWithHash, navigationOptions);
  } else {
    router.push(hrefWithHash, navigationOptions);
  }

  applyHashWhenReady(pathWithSearch, hrefWithHash, hash);
};
